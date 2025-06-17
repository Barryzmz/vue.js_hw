import { type ResponseBase } from '@/types/Base.d.ts'

export namespace LabelType {
  export interface LabelInfoRequest extends ImageData {
    userId: string
    time: number
  }

  export interface ImageDataResponse extends ResponseBase, ImageData {
    imgPath: string
    sheetInfoList: ImgInfo[]
  }

  export interface ImageData {
    imgInfo: ImgInfo
    labelInfo: LabelInfo
    judgeInfo: JadgeInfo
  }

  export interface ImgInfo {
    vorInputId: number
    imgStatus: number
    imgName: string
    toolId: string
    sheetId: string
    station: string
    prodName: string
    lotId: string
    chipId: string
    dataAx: number
    gateAx: number
    dftMode: string
    defCenterX: number
    defCenterY: number
    imgResolutionX: number
    imgResolutionY: number
    xMin: number // Training Label
    yMin: number // Training Label
    xMax: number // Training Label
    yMax: number // Training Label
    signalNo: string
    gateNo: string
    tester: string
    rgb: string
    ratio: number
    rpFlag: string
    retype: string
    lsrJudge: string
  }

  export interface LabelInfo {
    labelList: LebelDetail[]
    imgSize: ImgSize
  }

  export interface JadgeInfo {
    addLcv: boolean
    addLcvDftMode: string[]
    retype: string
    lsrJudge: string
    rpFlag: string
    lsrJudgeColletion: string
    retypeCatgory: string
  }

  export interface LebelDetail {
    repairType: string,
    type: string
    condition: string
    moveMethod: string
    runSteps: number
    sliter: number
    order: number
    lens: string
    repairRoute: number[]
    color: string
  }

  export interface ImgSize {
    imgW: number
    imgH: number
  }

  export interface Setting {
    retype: { value: string; subs: { value: string }[] }[]
    lsrJudge: { value: string; subs: { value: string; isHotKey: boolean}[] }[]
    lcv: { value: string }[]
    conditionCombo: ConditionCombo[]
    rpFlag: { isHotKey: boolean; name: string; value: string }[]
    combineKeyList: {
      key: string
      retype: string
      retypeCatgory: string
      lsrJudge: string
      lsrJudgeColletion: string
      rpFlag: string
      lcvList: string[]
      conditionList: { comboName: string; penType: string; condition: string }[]
    }[]
    queryHours: number
    runMode: string
    ConditionOpacity: number
    macros: Macro[]
    lensColorMappingList: LensColorMapping[]
    lensColors: Color[]
  }

  export interface ConditionCombo {
    comboName: string
    products: { value: string }[]
    pointConditions: Condition[]
    lineConditions: Condition[]
    blockConditions: Condition[]
  }

  export interface Condition {
    isHotKey: boolean
    condition: string
    moveMethod: string
    runSteps: number
    sliter: number
    order: number
    lens: string
    color: string
  }
  
  export interface MacroValue {
    repairType: string;
    type: string;
    moveMethod: string;
    repairRoute: number[];
    condition: string;
    runSteps: number;
    sliter: number;
    order: number;
    lens: string;
    color: string
  }
  
  export interface Macro {
    name: string;
    value: MacroValue[];
    isHotKey: boolean;
    hasValue: boolean;
    products: { value: string }[];
  }

  export interface PermissionProfile {
    groupList: PermissionGroup[] 
  }
  
  export interface PermissionGroup {
    groupName: string; 
    groupId: number; 
    permissionList: Permission []; 
    memberList: { id: string }[] 
  }

  export interface Permission {
    funcName: string, 
    modifiable: boolean,
  }
  
  export interface settingPermissionList{
    retype:  boolean;
    lcv: boolean;
    lsrJudge: boolean;
    conditionCombo: boolean;
    rpFlag: boolean;
    combineKeyList: boolean;
    runParams: boolean;
    macros: boolean;
    lensColor: boolean;
  }

  export interface LensColorMapping {
    lens: string;
    color: string
  }

  export interface Color {
    name: string;
    hex: string
  }
}
