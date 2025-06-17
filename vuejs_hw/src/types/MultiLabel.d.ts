import Konva from 'konva'

export type PenType = Konva.Line | Konva.Circle | Konva.Rect

export interface Config {
  penSize: number
  penColor: string
  heightLightColor: string
  groupColor: string
  stableColor: string
  trainingLabelDash: Array<number>
  hitStrokeWidth: number
  ConditionOpacity: number
  hotKey: {
    acceptLabel: string
    cancelLabel: string
    stageFrozen: string
  }
}

export interface Props {
  width: number
  height: number
  config?: Config
}

export interface MultiLabelInterface {
  imgData: HTMLImageElement
  labelInfoList: LabelInfo[]
  resetStage: resetStageFunc
  loadImage: loadImageFunc
  heightLight: heightLightFunc
  setPen: setPenFunc
  resetPen: resetPenFunc
  importLabel: importLabelFunc
  exportLabels: exportLabelsFunc
  getLabelInfoHistory: getLabelInfoHistoryFunc
  restGroup: restGroupFunc
  setMacroData: setMacroDataFunc
  newExportLabels: newExportLabelsFunc
  setEmptyMacros: setEmptyMacrosFunc
  setPenStableColor: setPenStableColorFunc
}

interface resetStageFunc {
  (): void
}

interface loadImageFunc {
  (val: string | HTMLImageElement): void
}

interface heightLightFunc {
  (label: LabelInfo): void
}

interface setPenFunc {
  (type: string, size?: number, ext?: any, color?: string, ConditionOpacity?: number): void
}

interface resetPenFunc {
  (): void
}

interface importLabelFunc {
  (type: string, positions: Array<number>, color: string, size?: number, ext?: any, ConditionOpacity?: LargeNumberLike): void
}

interface exportLabelsFunc {
  (): any
}

interface getLabelInfoHistoryFunc {
  (): UseManualRefHistoryReturn<LabelInfo[], LabelInfo[]>
}

interface restGroupFunc {
  (): void
}

interface setMacroDataFunc {
  (macroValue: any, imgResolutionX?: number, opacity?: number): void
}

interface newExportLabelsFunc {
  (labelList: LabelInfo[]): any
}

interface setEmptyMacrosFunc {
  (macros?: Macro[]): any
}

interface setPenStableColorFunc {
  (color?: string): any
}

