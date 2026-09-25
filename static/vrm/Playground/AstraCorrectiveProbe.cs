// Astra phase 15, stage 1, latest 25-corrective model.
// Copy ONLY this file into Warudo's Playground folder.
// No Unity Editor, external packages, file access, or network access required.
// Runtime integration has not yet been verified in the user's Warudo version.
using System;
using UnityEngine;
using Warudo.Core.Attributes;
using Warudo.Core.Graphs;
using Warudo.Plugins.Core.Assets.Character;

namespace AstraExperiment {
    public enum AstraProbeSide { Left, Right }

    [NodeType(Id = "cbed9168-ec6a-4eda-b2a3-af6d4300ca6f",
        Title = "Astra Corrective Probe", Category = "Astra", Width = 2f)]
    public class AstraCorrectiveProbe : Node {
        [DataInput] public CharacterAsset Character;
        [DataInput] public AstraProbeSide Side = AstraProbeSide.Left;
        [DataInput] public bool EnableManualTest = false;
        [DataInput, FloatSlider(0f, 1f)] public float TestWeight = 0f;
        [Markdown] public string Status = "Select Astra. Manual test starts disabled.";

        private CharacterAsset boundCharacter;
        private Transform boundRoot;
        private SkinnedMeshRenderer coat;
        private Mesh boundMesh;
        private int index = -1;
        private string boundKey;
        private float fullWeight;
        private bool ownsWeight;
        private float originalWeight;
        private float leftAngle = -1f, rightAngle = -1f;
        private float applied = -1f, lateReadback = -1f, finalReadback = -1f;
        private float nextScan, nextStatus;
        private string bindingStatus = "Waiting for character.";

        [DataOutput] public float LeftElbowDegrees() { return leftAngle; }
        [DataOutput] public float RightElbowDegrees() { return rightAngle; }

        // These are geometric bend angles, NOT Blender's signed local XYZ angles.
        // They must not be fed directly into the six-axis contact formulas.
        private static float Bend(Animator animator, HumanBodyBones upper,
            HumanBodyBones lower, HumanBodyBones hand) {
            if (animator == null || !animator.isHuman) return -1f;
            Transform a = animator.GetBoneTransform(upper);
            Transform b = animator.GetBoneTransform(lower);
            Transform c = animator.GetBoneTransform(hand);
            if (a == null || b == null || c == null) return -1f;
            Vector3 u = b.position - a.position, v = c.position - b.position;
            if (u.sqrMagnitude < 1e-10f || v.sqrMagnitude < 1e-10f) return -1f;
            return Vector3.Angle(u, v); // Straight = 0 degrees.
        }

        protected override void OnCreate() {
            base.OnCreate();
            EnableManualTest = false;
        }

        public override void OnLateUpdate() {
            base.OnLateUpdate();
            try {
                Tick();
            } catch (Exception e) {
                Release();
                EnableManualTest = false;
                bindingStatus = "Stopped: " + e.GetType().Name + ": " + e.Message;
                BroadcastDataInput(nameof(EnableManualTest));
            }
            if (Time.realtimeSinceStartup >= nextStatus) {
                nextStatus = Time.realtimeSinceStartup + 0.25f;
                PublishStatus();
            }
        }

        private void Tick() {
            string key = Side == AstraProbeSide.Left ? "CORR_Elbow_L_90" : "CORR_Elbow_R_90";
            Transform root = Character == null ? null : Character.MainTransform;
            if (boundCharacter != Character || boundRoot != root || boundKey != key ||
                (coat != null && coat.sharedMesh != boundMesh)) {
                Release();
                coat = null; boundMesh = null; index = -1;
                boundCharacter = Character; boundRoot = root; boundKey = key;
                nextScan = 0f;
            }
            if (Character == null || !Character.Active || root == null) {
                Release(); leftAngle = rightAngle = -1f;
                bindingStatus = "Select an active, loaded Astra character.";
                return;
            }

            leftAngle = Bend(Character.Animator, HumanBodyBones.LeftUpperArm,
                HumanBodyBones.LeftLowerArm, HumanBodyBones.LeftHand);
            rightAngle = Bend(Character.Animator, HumanBodyBones.RightUpperArm,
                HumanBodyBones.RightLowerArm, HumanBodyBones.RightHand);
            if (coat == null && Time.realtimeSinceStartup >= nextScan) {
                nextScan = Time.realtimeSinceStartup + 1f;
                Bind(root, key);
            }
            if (!EnableManualTest) { Release(); return; }
            if (coat == null || index < 0) return;
            if (float.IsNaN(TestWeight) || float.IsInfinity(TestWeight)) {
                Release(); bindingStatus = "TestWeight must be finite."; return;
            }
            if (!ownsWeight) {
                originalWeight = coat.GetBlendShapeWeight(index);
                ownsWeight = true;
            }
            applied = Mathf.Clamp01(TestWeight);
            coat.SetBlendShapeWeight(index, applied * fullWeight);
            lateReadback = coat.GetBlendShapeWeight(index) / fullWeight;
        }

        private void Bind(Transform root, string key) {
            SkinnedMeshRenderer candidate = null;
            int matches = 0;
            foreach (SkinnedMeshRenderer renderer in root.GetComponentsInChildren<SkinnedMeshRenderer>(true)) {
                Mesh mesh = renderer.sharedMesh;
                if (mesh == null || mesh.GetBlendShapeIndex(key) < 0 ||
                    mesh.GetBlendShapeIndex("CORR_UpperArmNatural_L") < 0 ||
                    mesh.GetBlendShapeIndex("CORR_UpperArmNatural_R") < 0 ||
                    mesh.GetBlendShapeIndex("CORR_FrontRaise_L") < 0 ||
                    mesh.GetBlendShapeIndex("CORR_FrontRaise_R") < 0) continue;
                candidate = renderer; matches++;
            }
            if (matches != 1) {
                bindingStatus = "Matching coat meshes: " + matches +
                    ". Expected exactly 1. Use astra_15_cloth_cleanup_v002.vrm (front-raise L/R required).";
                return;
            }
            Mesh m = candidate.sharedMesh;
            int i = m.GetBlendShapeIndex(key);
            int count = m.GetBlendShapeFrameCount(i);
            float weight = count == 1 ? m.GetBlendShapeFrameWeight(i, 0) : 0f;
            if (count != 1 || float.IsNaN(weight) || float.IsInfinity(weight) || weight <= 0f) {
                bindingStatus = "Unexpected blendshape frames/weight; no write performed.";
                return;
            }
            coat = candidate; boundMesh = m; index = i; fullWeight = weight;
            bindingStatus = "Found " + candidate.name + " / " + key +
                " (Unity full weight " + fullWeight.ToString("0.###") + ").";
        }

        public override void OnEndOfFrame() {
            base.OnEndOfFrame();
            // A different updater could overwrite the value after OnLateUpdate.
            // Report that separately from successful immediate readback.
            if (ownsWeight && coat != null && coat.sharedMesh == boundMesh)
                finalReadback = coat.GetBlendShapeWeight(index) / fullWeight;
        }

        [Trigger] public void StopAndRestore() {
            EnableManualTest = false;
            Release();
            BroadcastDataInput(nameof(EnableManualTest));
            PublishStatus();
        }

        private void Release() {
            if (ownsWeight && coat != null && coat.sharedMesh == boundMesh && index >= 0)
                coat.SetBlendShapeWeight(index, originalWeight);
            ownsWeight = false;
            applied = lateReadback = finalReadback = -1f;
        }

        private static string Number(float value) {
            return value < 0f ? "unavailable" : value.ToString("0.000");
        }

        private void PublishStatus() {
            Status = bindingStatus + "  \nLeft elbow: " + Number(leftAngle) +
                " deg; Right elbow: " + Number(rightAngle) + " deg (straight = 0)." +
                "  \nManual: " + (ownsWeight ? "ON" : "OFF") +
                "; requested: " + Number(applied) +
                "; immediate: " + Number(lateReadback) +
                "; end-of-frame: " + Number(finalReadback) +
                ".  \nSingle-shape diagnostic only. Automatic corrections are not enabled.";
            BroadcastDataInput(nameof(Status));
        }

        protected override void OnDestroy() {
            Release();
            base.OnDestroy();
        }
    }
}
