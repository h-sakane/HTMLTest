# Astra VRM検証版

最新の**補正形状データ検証用**は `astra_14_upperarm_corrective_data_v001.vrm`（約68.1 MB）。曲げた二の腕の盛り上がりを抑えた版で、肘14個＋接触7個＋二の腕2個の補正形状を含む。**自動補正ドライバーは含まない**。43メッシュ・7姿勢の再読み込み比較では、テスト側から補正値を明示的に与えて最大差約0.043122 mm。読み込むだけで制作版と同じ補正が動く完成版ではない。制御仕様は `astra_14_upperarm_corrective_control.json`、詳細は[二の腕の修正報告](../docs/phase_14_natural_upperarm.md)。最終保存は `astra_14u_natural_upperarm_roundtrip.blend`。

以下は旧版の履歴。旧VRMは比較用として保持している。

前版の `astra_14_elbow_corrective_data_v001.vrm`（約64 MB）は二の腕を細くする前の形状データ。肘14＋接触7補正、制作版14r。[接触修正・出力検証報告](../docs/phase_14_elbow_contact_and_morph_data.md)を参照。

最新の肘形状確認はBlenderの **`astra_14m_snow_guided_elbow_review.blend`**。公式Snowの曲げた肘を参考にした角度依存の補正を使用するが、既存の一部姿勢で交差が残り、VRMへの移植も未実施。この版のVRMは出力していない。[形状確認版の報告](../docs/phase_14_snow_guided_elbow_review.md)を参照。

当面の比較基準は **`astra_14_elbow_volume_v002.vrm`**（14h）。後続の `astra_14_firm_sleeves_v001.vrm`（14k）は肘の見た目が悪化したとのユーザーレビューにより不採用。いずれも肘の最終完成版ではない。[肘の資料確認と修正方針](../docs/phase_14_elbow_reference_review.md)を参照。以下の14k検査結果は試行履歴として保持する。
Blender公式Human Base MeshesのRealistic手モデルを直接採用し、左右の指骨・ウェイトを新規作成した。
肩・脇、靴、6表情、8系統の炎Spring Boneを引き継ぎ、袖口は新しい手へ合わせて最大20 mm短くした。
手の見た目はユーザー承認済み。炎・ハイネックの襟・靴の甲を軽量化し、面数は28.5%、ファイル容量は20.7%減った。
軽量化時には手・表情・白衣本体・パンツなど30メッシュの形状・UV・ウェイトを保持した。
Phase 13で、手の形状を保って親指の付け根・第一指間部のウェイトを調整した。つまむ・中指への対立・握る開閉動作は145フレームで交差0。
その時点の実VRM再読み込みも43メッシュ・36姿勢と6表情を確認済み。詳細は[Phase 13報告](../docs/phase_13_hand_contact_report.md)を参照。
Blender再読み込みの手と白衣には法線表示の補正を施した。VRMファイル自体への補正ではなく、Warudo側の陰影は実機で確認する。
過去のVRMと途中版は検証履歴として保持している。
Phase 14の統合確認後、SURPRISED・CONFUSEDの肘内側と、ひねり時の脇下を滑らかに修正した。
その後、正面・前方3/4で平たく見える肘に補助骨2本を追加し、外側の丸みと内側の圧縮を調整した。待機時の輪郭、手・顔・炎を保持した。
最新の袖調整では、袖を腕の骨の軸へ合わせ、肩補正の範囲とウェイトを整理して上腕・前腕の太さを保ちやすくした。待機時の袖にも形状変更がある。骨・トポロジーは追加していない。
最新の実VRM再読み込み43部品・22姿勢は最大差0.028469 mm。動作検査72サンプルで手と白衣の交差0、白衣自己交差は69サンプルで0。既知の前上げ90度は405ペア、今回追加した強い肩回転の診断2姿勢は52／40ペアが肩・脇に残る。[最新の袖調整報告](../docs/phase_14_firm_sleeve_report.md)を参照。
旧ファイル `astra_14_elbow_volume_v001.vrm` は肘の回転制約が出力されなかった試行版なので使用しない。その問題は旧v002で解消し、今回の `astra_14_firm_sleeves_v001.vrm` にも正常に引き継いだ。[前回の肘修正記録](../docs/phase_14_elbow_volume_fix.md)を参照。
採用仕様は、身体・頭部の動きに反応する揺れのみ。静止時の常時揺らぎとWarudoの風制御は不要。
Blenderで作成した風の比較映像・コードは試作記録として保持し、本番運用には追加しない。

## Warudoでの確認手順

1. Warudoの **Menu → Open Data Folder** を開く。
2. `Characters` に比較基準の`astra_14_elbow_volume_v002.vrm`をコピーする。14kの `astra_14_firm_sleeves_v001.vrm` は採用しない。
3. Characterの **Source** からモデルを選ぶ。初期設定は **Onboarding Assistant → Basic Setup** からも行える。
4. まず静止状態で全身、頭部、眼鏡と目・口の透過順を確認する。
5. C270nでMediaPipeの顔・手追跡を設定し、首の向き、左右の手、親指、腕上げ、画角外からの復帰を確認する。

[公式のモデル読み込み手順](https://docs.warudo.app/docs/assets/character)
／[MediaPipe](https://docs.warudo.app/docs/mocap/mediapipe)

## この版の範囲

- 標準Humanoid、指骨、Head固定の目・口・眼鏡を含む。画像はVRM内にすべて埋め込み済み。
- 手は公式モデルの自然な形状を基準とする。親指の対立・つまむ・軽く握る動作を調整し、左右の手・袖との交差を検査した。実VRMも24の手・手首姿勢で交差0。物体のサイズに合わせた把持と、追跡入力による対立・感度調整は実機確認を残す。確認用ポーズ動画はVRMへ埋め込んでいない。
- NeutralはBasis。Smile=`happy`、Surprised=`surprised`、Tired/Shout/Confusedは同名のcustom Expression。
- 表情は手動で1つを選択する。選択中の口は固定。前のExpressionを0にしてから次へ切り替える。
- 瞬き・口パクは未作成。その他の空プリセットは動作しない。
- 初期方針どおりカメラ口開き・音声口パクを無効にする。顔の向きの追跡とは別に扱う。
- 炎は青い半透明MToon。密度は静止テクスチャ。8系統のSpring Boneで炎全体に移動への遅れを作る。v002では側面・背面の可動範囲と揺れ量を拡大した。
- 静止後に揺れが収まる動作を採用する。風は追加しない。確認動画の試験風はVRMへ埋め込んでいない。
- 肩・脇は衣装用補助骨10本とVRM 1.0回転制約へ移植し、追従量・中心・ウェイトを追加調整した。
  前上げ時の脇下・背面にはふくらみが残る。Warudo上で補助骨が連動するか確認する。
- 肘の補助骨2本もVRM 1.0回転制約で前腕に半分追従する。衣装制約は合計12個。
- 前版で中央に重なっていた左右の靴を、Commonの配置へ修正した。
- 約40.9万三角形。初回の軽量化を実施済みだが、実機fps・透明面の描画負荷は未確認。

Blenderでの再読み込み比較は実施済み。従来の前上げ90度と、強い肩回転時の局所的な交差は残る。**Warudo上の見た目・動作の確認はまだ行っていない。**
採用済み制作モデルと過去チェックポイントは保持している。

比較・検査結果：[親指の対立・接触動作](../docs/phase_13_hand_contact_report.md)
／[軽量化・統合検証](../docs/phase_12_optimization_report.md)
／[公式の手モデル採用](../docs/phase_11_official_hands_report.md)
／[前版の手の見た目の再調整](../docs/phase_11_hand_anatomy_report.md)
／[前版の手指とVRM再読み込み報告](../docs/phase_11_hands_report.md)
／[炎の揺れとVRM再読み込み報告](../docs/phase_10_campfire_motion_report.md)
／[表情とVRM再読み込み報告](../docs/phase_09_facial_report.md)
／[肩・脇の追加調整報告](../docs/phase_08_shoulder_surface_report.md)
／[初回出力の記録](../docs/phase_08_vrm_early_report.md)
