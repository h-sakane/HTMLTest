# Astra — Warudo補正制御の実機確認

見た目・袖口・表情・炎・トラッキングを確認する場合は、まず [VRMのWarudo確認チェックリスト](../exports/README.md#warudoでの確認手順)を使用する。このREADMEは補正制御の導入と試験に関する手順。

## 最新モデルへの更新

後続の白衣修正により、最新は **`faia_beta.vrm`**。
前上げ補正2個を追加し、制御対象は25個になった。最新の式は
`exports/astra_15_cloth_corrective_control.json` を参照する。
下記の単一補正確認ノードは、この新版にも同じキー名で使用できる。
`core/AstraCorrectiveMath.cs` は23式の旧試作であり、最新モデルの全自動制御に流用せず、接続時に25式へ更新する。
[白衣・出力法線の修正報告](../docs/phase_15_cloth_cleanup.md)も参照。

## 現在の到達点

最初の工程である「補正1個の操作と肘角度の取得」を確認するノードを作成した。
**Warudo実機ではまだコンパイル・動作確認していない。自動補正の完成版ではない。**
Unity Editorの導入は不要。Warudoの[Playground](https://docs.warudo.app/docs/scripting/playground)でC#を読み込む。

初期確認対象は `exports/astra_14_wrist_cuff_v002.vrm`。現在の推奨対象は上記の新版。
旧 `astra_14_upperarm_corrective_data_v001` にも補正形状はあるが、袖口修正はv002に含まれる。
確認ノードを作成した時点では、モデル・VRM・承認済みチェックポイントは変更していなかった。後続のモデル修正は冒頭の最新モデル案内を参照。

## 導入するファイル

**`playground/AstraCorrectiveProbe.cs` の1ファイルだけ**を使う。
`core/` と `tests/` は制作側の計算・テスト用で、Playgroundへコピーしない。

1. Warudoのデータフォルダーを開き、`Playground` に上記 `.cs` をコピーする。
2. コンパイル完了後、確認用Blueprintへ `Astra` カテゴリーの **Astra Corrective Probe** を1個追加する。
3. `Character` でAstraを選択する。ノードはフロー配線なしで更新される設計。
4. `Enable Manual Test` は最初OFFのままにする。Statusに `Found` と白衣メッシュ名が出ることを確認する。

同名ノードは1個だけ使用する。コンパイルエラーの通知が出た場合は、通知内のエラー全文を確認する。
ファイルのコピーやWarudoへの導入は、この制作PCではまだ実施していない。

## 工程1：最小確認

### 肘角度

左右の腕をゆっくり伸ばし、曲げる。Statusの `Left/Right elbow` が連続して変わることを確認する。
数値はモデルの肩・肘・手首の位置から求め、伸ばした状態が約0度、直角が約90度。
`unavailable` はHumanoidの対象ボーンを取得できていない状態。

この数値は幾何学的な曲げ角度であり、Blenderの符号付きローカルXYZ角度とは異なる。
接触補正の式へそのまま入力しない。

### 補正1個の反映

1. 左肘を約90度曲げ、できるだけ静止する。
2. `Side = Left`、`Test Weight = 0` とし、`Enable Manual Test` をONにする。
3. `Test Weight` を `0 → 1 → 0` に変更する。対象は **`CORR_Elbow_L_90` だけ**。
4. 肘付近の白衣形状とStatusを確認する。`requested`、`immediate`、`end-of-frame` が同じ値になるかを見る。
5. **Stop And Restore** を押す。右側も `Side = Right` で同様に確認する。

`immediate` だけ一致し `end-of-frame` が異なる場合、別の処理による上書きが疑われる。
数値が一致しても、画面上で変化が見えることを別途確認する。
これは1個の補正を操作できるかの試験なので、この状態の腕全体を完成形として評価しない。

OFF・停止・左右切替・キャラクター切替・ノード削除時は、操作していた補正値を取得時の値へ戻す設計。
顔の表情、手首、骨の姿勢は変更しない。該当する白衣が複数見つかった場合は適用しない。

## 後続工程

1. 上記がWarudo実機で通ることを確認する。
2. インポート後の骨座標を制作版へ対応付け、肘14個・二の腕2個を連動させる。
3. 肩と前腕の姿勢も使う接触補正7個を追加し、顔・炎・トラッキングと併用確認する。
4. 最新15版の前上げ補正2個を追加し、計25個の連動を確認する。

`core/AstraCorrectiveMath.cs` は既存23補正の計算をC#へ移したもの。
**Unityの角度を制作版へ変換する接続部分は未実装**で、現時点では自動適用しない。
前上げ90度の脇下交差は、後続の制作版で追加2補正により解消した。Warudoでの再現には最新25式の実装と実機検証が必要。

## 検証記録

- Blenderの実ドライバー値102姿勢×23補正との最大絶対誤差：`6.2232e-7` 未満。
- 肘の連続1801サンプルで補正の連続性、上限、左右の合計を検査。
- ノードの開始時OFF、対象切替と復元、重複拒否、重み単位の変換など16項目をテスト用API代替で検査。
- API代替を用いた検査は、WarudoのSDKとの互換性や実機での表示を保証しない。
- 検証結果：`validation/phase_15_math_verification.json`、`validation/phase_15_probe_verification.json`。

実機確認時には、Warudoのバージョン、コンパイルの成否、Statusの表示、左右の補正が見た目にも反映されたかを記録する。

## 参照した公式資料

- [Playgroundとホットリロード](https://docs.warudo.app/docs/scripting/playground)
- [カスタムノード](https://docs.warudo.app/docs/scripting/api/nodes)
- [更新順序・ライフサイクル](https://docs.warudo.app/docs/scripting/api/entities)
- [ポート・UI・トリガー](https://docs.warudo.app/docs/scripting/api/ports-and-triggers)
- [公式ノード例](https://github.com/HakuyaLabs/WarudoPlaygroundExamples/blob/master/ExampleNode.cs)
- [UnityのBlendShape反映API](https://docs.unity3d.com/ScriptReference/SkinnedMeshRenderer.SetBlendShapeWeight.html)

これらを基に実装したが、ユーザー環境のWarudoバージョンとの照合は未実施。
