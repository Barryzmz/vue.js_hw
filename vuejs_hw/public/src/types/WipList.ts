export interface Props {
  isShow: boolean,
  queryHours: number
}

export interface LotInfoList {
  LotInfo: LotInfo[]
}

export interface LotInfo {
  lotId: string,
  capturing: boolean,
  sheetNum: number,
  pointNum: number,
  pointInfoList: PointInfoList[] 
}

export interface PointInfoList {
  toolId: string,
  station: string,
  prodName: string,
  chipId: string,
  dataAx: string,
  gateAx: string,
  dftMode: string,
  plotStatus: string,
  opId: string
}

export interface LotInfoDetail {
  lotId: string,
  capturing: boolean,
  sheetNum: number,
  pointNum: number,
  toolId: string,
  station: string,
  prodName: string,
  chipId: string,
  dataAx: string,
  gateAx: string,
  dftMode: string,
  plotStatus: string,
  opId: string 
}