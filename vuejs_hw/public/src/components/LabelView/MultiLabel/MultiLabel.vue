<template>
  <v-stage ref="stageEle">
    <v-layer ref="layerEle">
      <v-image ref="imageEle" />
    </v-layer>
  </v-stage>

  <div id="menu">
    <div><button id="delete-button">Delete</button></div>
    <div v-show="isShowBindMacros && settingPermissionList?.macros">
      <button id="group-button" @click="toggleMacrosList">Group</button>
      <div id="macroSubmenu" v-show="isMacrosListVisible">
        <el-row
          @click="bindMacros(item.name)"
          v-for="item in emptyMacros"
          :key="item.name"
        >
          <button >
            {{ item.name }}
          </button>
        </el-row>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, type Ref } from 'vue'
import { useManualRefHistory, type UseManualRefHistoryReturn } from '@vueuse/core'
import Konva from 'konva'

import type { Config, Props, PenType } from '@/types/MultiLabel.d.ts'
import { LabelInfo } from '.'
import { type LabelType } from '@/types/Label.d'

const stageEle: Ref<Konva.Stage | null> = ref(null)
const layerEle: Ref<Konva.Layer | null> = ref(null)
const imageEle: Ref<Konva.Image | null> = ref(null)

let currentShape: Konva.Shape
let menuNode: HTMLElement
let stage = {} as Konva.Stage
let layer = {} as Konva.Layer
let image = {} as Konva.Image
let group = new Konva.Group({
  draggable: true
});

let config = ref<Config>({
  penSize: 5,
  penColor: '#808080',
  heightLightColor: '#6496c8',
  groupColor: '	#0000C6',
  stableColor: '#00FF00',
  trainingLabelDash: [7, 4],
  hitStrokeWidth: 20,
  ConditionOpacity: 1,
  hotKey: {
    acceptLabel: 'Control',
    cancelLabel: 'Backspace',
    stageFrozen: 'Shift'
  }
})
const currentLabelStableColor = ref('');
let imgData = ref(new Image())
let status = 'init'
let penTemp = {
  size: 0,
  color: '',
  ConditionOpacity: 1
}
let extTemp = {}
let trainingPoints = {
  startX: 0,
  startY: 0,
  endX: 0,
  endY: 0
}

let currentLabelInfo: LabelInfo | null = null
let currentPen: PenType | null = null
let previewPen: Konva.Line | null = null

// 要畫Macro的資料
let setMacro = {
  macroValue: null,
  imgResolutionX: 0,
  opacity: 0
}
let emptyMacros = ref<LabelType.Macro[]| undefined | null>(null)

let isShowBindMacros = ref(true)
let isMacrosListVisible = ref(false)
const labelInfoList = ref<LabelInfo[]>([])

// 框選的方塊
var selectionRectangle = new Konva.Rect({
  stroke: 'black',
  strokeWidth: 4,
  dash: [20, 10],
});
var selectRectX1: number, selectRectX2: number, selectRectY1: number, selectRectY2: number;
var selectRectState = false;

let labelInfoHistory: UseManualRefHistoryReturn<LabelInfo[], LabelInfo[]>
const getLabelInfoHistory = () => {
  return labelInfoHistory
}

const permissionList = ref<LabelType.PermissionGroup>()
const settingPermissionList = ref<LabelType.settingPermissionList>()

// 載入圖片
async function loadImage(val: string | HTMLImageElement): Promise<void> {
  image.image(undefined)
  hideMenu()

  if (typeof val == 'string') {
    return new Promise((resolve) => {
      let img = new Image()
      img.onload = () => {
        imgData.value = img
        image.image(imgData.value)
        fitStage()
        resolve()
      }
      img.src = val
    })
  } else {
    return new Promise((resolve) => {
      imgData.value = val as any
      image.image(imgData.value)
      fitStage()
      resolve()
    })
  }
}

// 將圖片吻合Viewport後並置中
function fitStage() {
  let scaleRatioX = stage.width() / imgData.value.width
  let scaleRatioY = stage.height() / imgData.value.height
  let scaleRatio = Math.floor(Math.min(scaleRatioX, scaleRatioY) * 100) / 100

  changeImageScale(scaleRatio)

  stage.x((stage.width() - imgData.value.width * scaleRatio) / 2)
  stage.y((stage.height() - imgData.value.height * scaleRatio) / 2)
}

function changeImageScale(val: number) {
  stage.scale({ x: val, y: val })
}

function resetStage() {
  resetPen()
  labelInfoList.value.forEach((item) => {
    item.instance?.destroy()
  })
  labelInfoList.value.splice(0, labelInfoList.value.length)
  image.image(undefined)
}
 

function setPermissionList() {
  const storPermissionList = sessionStorage.getItem('permissionList')
  if (storPermissionList !== null) {
    permissionList.value = {  
      groupName: '0', 
      groupId: -1, 
      memberList: [{id: ''}],
      permissionList: JSON.parse(storPermissionList)}
  }
  settingPermissionList.value = {
    retype:  isModifiable('Retype'),
    lcv: isModifiable('LCV'),
    lsrJudge: isModifiable('LSR Judge'),
    conditionCombo: isModifiable('Condition'),
    rpFlag: isModifiable('RP Flag'),
    combineKeyList: isModifiable('Combine Key'),
    runParams: isModifiable('Run Params'),
    macros: isModifiable('Macro'),
  };
}

function isModifiable(funcName: string) {
  if(permissionList.value) {
    const permission = permissionList.value.permissionList.find((perm: LabelType.Permission) => perm.funcName === funcName);
    return permission ? permission.modifiable : false;
  }
  return false;
}

// 重設目前的Label Pen
function resetPen() {
  stage.draggable(true)
  currentPen?.destroy()
  currentPen = null

  previewPen?.destroy()
  previewPen = null
  stage.container().style.cursor = ''
  status = ''
  currentLabelInfo = null
  extTemp = {}
  setMacro.macroValue= null
}

// 凸顯特定Label
function heightLight(label?: LabelInfo | null, id?: string, isHeightLigt?: boolean) {
  let tempItem: LabelInfo | null = null

  labelInfoList.value.forEach((item) => {
    if (label && item != label) return
    if (id && item.id != id) return

    tempItem = item
    let className = item.instance.className
    
    const parentGroup = item.instance.getParent();
    if (parentGroup instanceof Konva.Group) {
      group.getChildren().map((currentShape) => {
        if (currentShape instanceof Konva.Rect || currentShape instanceof Konva.Circle) {
          if (isHeightLigt === undefined) {
            currentShape.fill() == config.value.groupColor 
          } else {
            currentShape.fill(config.value.groupColor)
          }
        } 
        else if (currentShape instanceof Konva.Line) {
          if (isHeightLigt === undefined) {
            currentShape.stroke() == config.value.groupColor 
          } else {
            currentShape.stroke(config.value.groupColor)
          }
        }
      });
    }
    else{
      if (className == 'Line' || (item.type == 'training' && className == 'Rect')) {
        if (isHeightLigt === undefined) {
          item.instance.stroke(
            item.instance.stroke() == item.oriColor ? config.value.heightLightColor : item.oriColor
          )
        } else {
          item.instance.stroke(isHeightLigt ? config.value.heightLightColor : item.oriColor)
        }
      } else if (className == 'Circle' || (item.type == 'block' && className == 'Rect')) {
        if (isHeightLigt === undefined) {
          item.instance.fill(
            item.instance.fill() == item.oriColor ? config.value.heightLightColor : item.oriColor
          )
        } else {
          item.instance.fill(isHeightLigt ? config.value.heightLightColor : item.oriColor)
        }
      }
    }
  })

  tempItem?.instance.moveToTop()
}

// 設定Label Pen
function setPen(type: string, size?: number, ext?: any, color?: string, ConditionOpacity?: number) {
  if (!['point', 'line', 'block', 'training'].includes(type)) throw Error('pen type wrong')

  if (currentPen && currentPen.destroy) {
    currentPen.destroy()
  }

  let id = Math.random().toString()
  currentLabelInfo = null
  penTemp.size = size || penTemp.size || config.value.penSize
  penTemp.color = color || penTemp.color || config.value.penColor
  penTemp.ConditionOpacity = ConditionOpacity || penTemp.ConditionOpacity || config.value.ConditionOpacity
  
  if (type == 'point') {
    currentPen = new Konva.Circle({
      id: id,
      radius: penTemp.size/2,
      fill: penTemp.color,
      opacity: penTemp.ConditionOpacity, // 設置矩形的透明度為 0.5（範圍從 0 到 1）
      hitFunc: (context, shape) => {
        context.beginPath()
        context.arc(0, 0, config.value.hitStrokeWidth / 2, 0, Math.PI * 2, true)
        context.closePath()
        context.fillStrokeShape(shape)
      }
    })
  } else if (type == 'line') {
    currentPen = new Konva.Line({
      id: id,
      points: [],
      stroke: penTemp.color,
      strokeWidth: penTemp.size,
      lineCap: 'round',
      lineJoin: 'round',
      opacity: penTemp.ConditionOpacity,
      hitStrokeWidth: config.value.hitStrokeWidth
    })

    previewPen = new Konva.Line({
      id : 'previewPen',
      points: [],
      stroke: penTemp.color,
      strokeWidth: penTemp.size,
      lineCap: 'round',
      lineJoin: 'round',
      opacity: penTemp.ConditionOpacity
    })

    layer.add(previewPen)
    previewPen.moveToTop()
    previewPen.hide()
  } else if (type == 'block') {
    currentPen = new Konva.Rect({
      id: id,
      fill: penTemp.color,
      opacity: penTemp.ConditionOpacity,
      hitStrokeWidth: config.value.hitStrokeWidth
    })
  } else if (type == 'training') {
    currentPen = new Konva.Line({
      id: id,
      points: [],
      stroke: penTemp.color,
      strokeWidth: penTemp.size,
      dash: config.value.trainingLabelDash,
      opacity: penTemp.ConditionOpacity,
      hitStrokeWidth: config.value.hitStrokeWidth
    })
  }

  currentLabelInfo = new LabelInfo()
  currentLabelInfo.id = id
  currentLabelInfo.type = type
  currentLabelInfo.instance = currentPen as PenType
  currentLabelInfo.oriColor = penTemp.color
  currentLabelInfo.oriSize = penTemp.size

  currentPen?.on('mouseover', () => {
    heightLight(null, id, true)
  })

  currentPen?.on('mouseout', () => {
    heightLight(null, id, false)
  })

  if (ext) {
    extTemp = ext
  }

  currentLabelInfo.ext = Object.assign({}, ext || extTemp)
  stage.container().style.cursor = 'crosshair'
  stage.draggable(true)

  return currentLabelInfo
}

function setPenStableColor(color?: string){
  currentLabelStableColor.value = color  ?? config.value.stableColor;
}

// 設定Macro筆
function setMacroData (macroValue: any, imgResolutionX: number, opacity: number) {
  restGroup();
  let Macro = {
    macroValue: null,
    imgResolutionX: 0,
    opacity: 0
  }
  Macro.macroValue = macroValue;
  Macro.imgResolutionX = imgResolutionX;
  Macro.opacity = opacity;
  setMacro = JSON.parse(JSON.stringify(Macro))
  stage.container().style.cursor = 'crosshair'
}

// 開始依序畫Macro
function createMacro () {
  setMacro?.macroValue?.forEach((ele) => {
    if(ele.repairType == "point"){
      importMacroLabel(
        'point',
        ele.repairRoute,
        ele.color,
        ele.sliter / (setMacro.imgResolutionX),
        {
          condition: ele.condition,
          moveMethod: ele.moveMethod,
          runSteps: ele.runSteps,
          sliter: ele.sliter,
          order: ele.order,
          lens: ele.lens
        },
        setMacro.opacity
      )
    }
    else if(ele.repairType == "line"){
      importMacroLabel(
        'line',
        ele.repairRoute,
        ele.color,
        ele.sliter / (setMacro.imgResolutionX),
        {
          condition: ele.condition,
          moveMethod: ele.moveMethod,
          runSteps: ele.runSteps,
          sliter: ele.sliter,
          order: ele.order,
          lens: ele.lens
        },
        setMacro.opacity
      )
    }
    else if(ele.repairType == "block"){
      importMacroLabel('block', ele.repairRoute, ele.color, ele.sliter, {
          condition: ele.condition,
          moveMethod: ele.moveMethod,
          runSteps: ele.runSteps,
          sliter: ele.sliter,
          order: ele.order,
          lens: ele.lens
        },
        setMacro.opacity
      )
    }
  })
}

// 消除Macro偏移量，新增的macro會以鼠標為起始點
function removeMacrosOffset(clickX: number, clickY: number) {
  // 根据点击坐标处理数据
  if (setMacro && setMacro.macroValue) {
    const firstShapeData = setMacro?.macroValue[0];
    const firstShapeCoords = firstShapeData.repairRoute;
    const clickPositionX = clickX; //點擊的X
    const clickPositionY = clickY; //點擊的Y
    const offsetX = firstShapeCoords[0]; //圖形初始化的X
    const offsetY = firstShapeCoords[1]; //圖形初始化的Y
    setMacro?.macroValue.forEach((shape) => {
      const repairRoute = shape.repairRoute;

      if (shape.repairType === "point") {
        repairRoute[0] += (clickPositionX - offsetX);
        repairRoute[1] += (clickPositionY - offsetY);
      } else if (shape.repairType === "line" || shape.repairType === "block") {
        for (let i = 0; i < shape.repairRoute.length; i += 2) {
          repairRoute[i] += (clickPositionX - offsetX);
          repairRoute[i + 1] += ( clickPositionY - offsetY);
        }
      }
    });
  }
}

// Stage鍵盤事件
function keydown(e: KeyboardEvent) {
  e.preventDefault()
  if (e.key === config.value.hotKey.stageFrozen) {
    stage.draggable(false);
  }
  
  if (!currentLabelInfo) return
  if (status !== 'drawing') return
  // 按下完成目前Label的操作
  if (e.key === config.value.hotKey.acceptLabel) {
    stage.container().style.cursor = ''
    previewPen?.hide()
    currentLabelInfo.instance.setAttr('draggable', true) 
    currentLabelInfo.oriColor = currentLabelStableColor.value
    if (currentLabelInfo.type == 'point') {
      currentLabelInfo.instance.setAttr('fill', currentLabelStableColor.value) 
    } else if (currentLabelInfo.type == 'line') {
      currentLabelInfo.instance.setAttr('stroke', currentLabelStableColor.value) 
    } else if (currentLabelInfo.type == 'block') {
      currentLabelInfo.instance.setAttr('fill', currentLabelStableColor.value) 
    } else if (currentLabelInfo.type == 'training') {
      currentLabelInfo.instance.setAttr('stroke', currentLabelStableColor.value) 
    }

    if (currentLabelInfo.type === 'training') {
      labelInfoList.value.unshift(currentLabelInfo);
    } else {
      labelInfoList.value.push(currentLabelInfo);
    }
    currentPen = null
    let type = currentLabelInfo.type
    console.log('currentLabelInfo',currentLabelInfo)
    setPen(type)
    status = ''
    emit('labelAdded', currentLabelInfo)
  }
  // 按下取消正在Label的操作
  else if (e.key === config.value.hotKey.cancelLabel) {
    resetPen()
  }
}

// Stage鍵盤事件
function keyup(e: KeyboardEvent) {
  if (e.key === config.value.hotKey.stageFrozen) {
    stage.draggable(true);
  }
}

// 滑鼠滾輪縮放圖片
function mouseWheel(e: Konva.KonvaEventObject<MouseEvent>) {
  e.evt.preventDefault()

  let scaleBy = 1.05
  let oldScale = stage.scaleX()
  let pointer = stage.getPointerPosition() as Konva.Vector2d
  let mousePointTo = {
    x: (pointer.x - stage.x()) / oldScale,
    y: (pointer.y - stage.y()) / oldScale
  }
  let direction = (e.evt as WheelEvent).deltaY > 0 ? -1 : 1

  if (e.evt.ctrlKey) {
    direction = -direction
  }

  let newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy
  stage.scale({ x: newScale, y: newScale })

  let newPos = {
    x: pointer.x - mousePointTo.x * newScale,
    y: pointer.y - mousePointTo.y * newScale
  }
  stage.position(newPos)
}

// 滑鼠點擊後
function mouseClick(e: Konva.KonvaEventObject<MouseEvent>) {
  e.evt.preventDefault()
  let newX = Math.round((e.evt.offsetX - stage.x()) / stage.scaleX())
  let newY = Math.round((e.evt.offsetY - stage.y()) / stage.scaleY())
  if (e.evt.button !== 0) return;

  // 定位Label位置與大小
  if (currentLabelInfo != null) {
    handleCurrentLabelInfo(newX, newY)
  }
  // Macro指令
  else if(setMacro.macroValue != null) {
    removeMacrosOffset(newX, newY)
    createMacro();
    setMacro = {macroValue: null, imgResolutionX: 0, opacity: 0}
    resetPen()
    emit('macroAdded')
  }
  else if (e.evt.shiftKey){
    currentShape = e.target as Konva.Shape
    // 左按shift點選加入群組
    if(!(currentShape.getParent() instanceof Konva.Group)) {
      e.evt.preventDefault()
      if (e.target === stage || e.target.className == 'Image') {
        hideMenu()
        return
      }
      currentShape.draggable(false)
      group.add(currentShape);
      layer.add(group);
      layer.draw();
      heightLight(null, currentShape.attrs.id, true)
    }
    // 左按shift點選單一label取消加入群組
    else {
      e.evt.preventDefault()
      currentShape.remove();
      currentShape.draggable(true);
      layer.add(currentShape);
      layer.draw();
      heightLight(null, currentShape.attrs.id, true)
    }
  }
  // 點擊其他部分去取消群組
  else{
    if (e.target === stage || e.target.className == 'Image') {
      restGroup();
    }
  }
}


function handleCurrentLabelInfo(newX: number, newY: number) {
  stage.draggable(false)
  layer.add(currentPen as PenType)
  currentPen?.moveToTop()
  if (currentLabelInfo == null) return;

  if (currentLabelInfo.type == 'line') {
    if (status == 'draw_line_start' || status == 'drawing') {
      ;(currentPen as Konva.Line).points((currentPen as Konva.Line).points().concat([newX, newY]))
      status = 'drawing'
    }
    else{
      status = 'draw_line_start'
      ;(currentPen as Konva.Line).points((currentPen as Konva.Line).points().concat([newX, newY]))
    }
  } else if (currentLabelInfo.type == 'point') {
    ;(currentPen as Konva.Circle).position({ x: newX, y: newY })
    status = 'drawing'
  } else if (currentLabelInfo.type == 'block') {
    if (status == 'draw_rect_start') {
      status = 'drawing'
    } else {
      status = 'draw_rect_start'
      currentPen?.position({ x: newX, y: newY })
      currentPen?.size({ width: 0, height: 0 })
    }
  } else if (currentLabelInfo.type == 'training') {
    if (status == 'draw_rect_start') {
      status = 'drawing'
    } else {
      status = 'draw_rect_start'
      trainingPoints.startX = newX
      trainingPoints.startY = newY
    }
  }
  currentPen?.moveToTop()
}

// 隨滑鼠移動事件，繪製預覽圖
function mouseMove(e: Konva.KonvaEventObject<MouseEvent>) {
  // e.evt.preventDefault()

  if (status == 'drawing' || status == 'draw_rect_start'|| status == 'draw_line_start') {
    let newX = Math.round((e.evt.offsetX - stage.x()) / stage.scaleX())
    let newY = Math.round((e.evt.offsetY - stage.y()) / stage.scaleY())

    if (
      currentLabelInfo &&
      currentLabelInfo.type == 'line' &&
      (currentPen as Konva.Line).points().length >= 2
    ) {
      let points = (currentPen as Konva.Line).points().slice(-2)
      points = points.concat([newX, newY])
      previewPen?.points(points)
      previewPen?.moveToTop()
      previewPen?.show()
    } else if (currentLabelInfo?.type == 'block' && status == 'draw_rect_start') {
      currentPen?.width(newX - currentPen.x())
      currentPen?.height(newY - currentPen.y())
    } else if (currentLabelInfo?.type == 'training' && status == 'draw_rect_start') {
      trainingPoints.endX = newX
      trainingPoints.endY = newY
      ;(currentPen as Konva.Line).points([
        trainingPoints.startX,
        trainingPoints.startY,
        trainingPoints.endX,
        trainingPoints.startY,
        trainingPoints.endX,
        trainingPoints.endY,
        trainingPoints.startX,
        trainingPoints.endY,
        trainingPoints.startX,
        trainingPoints.startY
      ])
    }
  }

  if (selectRectState) {
    selectRectX2 = Math.round((e.evt.offsetX - stage.x()) / stage.scaleX());
    selectRectY2 = Math.round((e.evt.offsetY - stage.y()) / stage.scaleX());
    
    selectionRectangle.setAttrs({
      visible: true,
      x: Math.min(selectRectX1, selectRectX2),
      y: Math.min(selectRectY1, selectRectY2),
      width: Math.abs(selectRectX2 - selectRectX1),
      height: Math.abs(selectRectY2 - selectRectY1),
    });
  }
}

function mouseDragstart(e: Konva.KonvaEventObject<MouseEvent>) {
  e.evt.preventDefault()
  if (e.target === stage || e.target.className == 'Image') {
        hideMenu()
        return
  }
  currentShape = e.target as Konva.Shape
}

function mouseDragend(e: Konva.KonvaEventObject<MouseEvent>) {
  // e.evt.preventDefault()
  if (e.target === stage || e.target.className == 'Image') {
    hideMenu()
    return
  }
  currentShape = e.target as Konva.Shape
  if (currentShape instanceof Konva.Circle) {
    currentShape.position({ x: Math.round(currentShape.getPosition().x )  , y: Math.round(currentShape.getPosition().y ) })
  } 
  else if (currentShape instanceof Konva.Rect) {
    currentShape.position({ x: Math.round(currentShape.getPosition().x )  , y: Math.round(currentShape.getPosition().y ) })
  } 
  else if (currentShape instanceof Konva.Line) {
    const updatedPoints = currentShape.points().map((point, index) => {
      return point + (index % 2 === 0 ? Math.round(currentShape.getPosition().x )  :  Math.round(currentShape.getPosition().y ) );
    });
    currentShape.points(updatedPoints)
    let shapeIndex = labelInfoList.value.findIndex((ele) => {
      return ele.id == currentShape.attrs.id
    })
    labelInfoList.value[shapeIndex].instance.attrs.points = updatedPoints;
    labelInfoList.value[shapeIndex].instance.setPosition({x:0,y:0});
  }
  else if (currentShape instanceof Konva.Group) {
    handleGroupChildPositions();
  } 

  emit('labelMoved')
}

function mouseDown(e: Konva.KonvaEventObject<MouseEvent>) {
  if (e.target !== stage && e.target.className !== 'Image') {
    hideMenu()
    return
  }
  currentShape = e.target as Konva.Shape
  if (e.evt.shiftKey){
    selectRectX1 = Math.round((e.evt.offsetX - stage.x()) / stage.scaleX());
    selectRectY1 = Math.round((e.evt.offsetY - stage.y()) / stage.scaleX());
    selectRectX2 = Math.round((e.evt.offsetX - stage.x()) / stage.scaleX());
    selectRectY2 = Math.round((e.evt.offsetY - stage.y()) / stage.scaleX());

    selectionRectangle.width(0);
    selectionRectangle.height(0);
    selectionRectangle.visible(true);
    selectRectState = true;
  }
}

function mouseUp(e: Konva.KonvaEventObject<MouseEvent>) {
  if (selectRectState == false) {
    return;
  }
  e.evt.preventDefault();
  var shapes = stage.find('Shape');
  var box = selectionRectangle.getClientRect();
  var selected = shapes.filter((shape) =>
    Konva.Util.haveIntersection(box, shape.getClientRect()) && shape !== selectionRectangle &&  shape !== image
  );
  let id = "";
  
  selected.forEach(shape => {
      shape.draggable(false);
      shape.moveTo(group);
      id = shape.attrs.id;
      heightLight(null, id, true)
  });
  layer.add(group)
  layer.draw();
  selectionRectangle.visible(false);
  selectRectState = false;
}

function handleGroupChildPositions() {
  let dx = group.getPosition().x;
  let dy = group.getPosition().y;
  group.setPosition({ x: 0, y: 0 });
  group.getChildren().map((currentShape) => {
    if (currentShape instanceof Konva.Circle) {
      currentShape.position({ x: Math.round(currentShape.getPosition().x + dx) , y: Math.round(currentShape.getPosition().y + dy) })
    }
    else if (currentShape instanceof Konva.Rect) {
      currentShape.position({ x: Math.round(currentShape.getPosition().x + dx) , y: Math.round(currentShape.getPosition().y + dy) })
    } 
    else if (currentShape instanceof Konva.Line) {
      const updatedPoints = currentShape.points().map((point, index) => {
        return point + (index % 2 === 0 ? Math.round(currentShape.getPosition().x + dx) : Math.round(currentShape.getPosition().y + dy) );
      });
      currentShape.points(updatedPoints);
      let shapeIndex = labelInfoList.value.findIndex((ele) => {
        return ele.id == currentShape.attrs.id
      })
    }
    
    return currentShape;
  });

}

// 將Label資訊轉換成匯出的格式
function exportLabels() {
  return labelInfoList.value.map((ele) => {
    let points = null

    if (ele.type == 'point') {
      points = (({ x, y }) => [x, y])(ele.instance.position())
    } else if (ele.type == 'line') {
      points = [...(ele.instance as Konva.Line).points()]
    } else if (ele.type == 'block') {
      points = [
        ele.instance.x(),
        ele.instance.y(),
        ele.instance.x() + ele.instance.width(),
        ele.instance.y() + ele.instance.height()
      ]
    } else if (ele.type == 'training') {
      let p = (ele.instance as Konva.Line).points()
      points = [p[0], p[1], p[4], p[5]]
    }

    return {
      type: ele.type,
      ext: ele.ext,
      points: points,
      color: ele.oriColor
    }
  })
}

// 將Label資訊轉換成匯出的格式
function newExportLabels(labelList: LabelInfo[]) {
  return labelList.map((ele) => {
    let points = null

    if (ele.type == 'point') {
      points = (({ x, y }) => [x, y])(ele.instance.position())
    } else if (ele.type == 'line') {
      points = [...(ele.instance as Konva.Line).points()]
    } else if (ele.type == 'block') {
      points = [
        ele.instance.x(),
        ele.instance.y(),
        ele.instance.x() + ele.instance.width(),
        ele.instance.y() + ele.instance.height()
      ]
    } else if (ele.type == 'training') {
      let p = (ele.instance as Konva.Line).points()
      points = [p[0], p[1], p[4], p[5]]
    }

    return {
      type: ele.type,
      ext: ele.ext,
      points: points
    }
  })
}

// 匯入Label
function importLabel(type: string, points: Array<number>, color: string, size?: number, ext?: any,  ConditionOpacity?: number) {
  resetPen()

  let tempLabel = setPen(type, size, ext, color, ConditionOpacity)
  tempLabel.instance.setAttr('draggable', true) 
  currentPen = null
  currentLabelInfo = null

  if (type == 'point') {
    tempLabel.instance.x(points[0])
    tempLabel.instance.y(points[1])
  } else if (type == 'line') {
    ;(tempLabel.instance as Konva.Line).points(points)
  } else if (type == 'block') {
    tempLabel.instance.x(points[0])
    tempLabel.instance.y(points[1])
    tempLabel.instance.width(points[2] - points[0])
    tempLabel.instance.height(points[3] - points[1])
  } else if (type == 'training') {
    ;(tempLabel.instance as Konva.Line).points([
      points[0],
      points[1],
      points[2],
      points[1],
      points[2],
      points[3],
      points[0],
      points[3],
      points[0],
      points[1]
    ])
  }

  layer.add(tempLabel.instance)
  labelInfoList.value.push(tempLabel)
  resetPen()
}

// 匯入MacroLabel
function importMacroLabel(type: string, points: Array<number>, color: string, size?: number, ext?: any, ConditionOpacity?: number) {
  let tempLabel = setPen(type, size, ext, color, ConditionOpacity)
  currentPen = null
  currentLabelInfo = null

  if (type == 'point') {
    tempLabel.instance.x(points[0])
    tempLabel.instance.y(points[1])
  } else if (type == 'line') {
    ;(tempLabel.instance as Konva.Line).points(points)
  } else if (type == 'block') {
    tempLabel.instance.x(points[0])
    tempLabel.instance.y(points[1])
    tempLabel.instance.width(points[2] - points[0])
    tempLabel.instance.height(points[3] - points[1])
  } else if (type == 'training') {
    ;(tempLabel.instance as Konva.Line).points([
      points[0],
      points[1],
      points[2],
      points[1],
      points[2],
      points[3],
      points[0],
      points[3],
      points[0],
      points[1]
    ])
  }
  layer.add(tempLabel.instance)
  labelInfoList.value.push(tempLabel)
  group.add(tempLabel.instance);
  layer.add(group);
  resetPen()
}

function restGroup() {
  var originalChildren = group.getChildren();
  var children = originalChildren.slice();
  for (var i = children.length - 1; i >= 0; i--) {
    children[i].remove();
    children[i].draggable(true);
    layer.add(children[i]);
    layer.draw();
    heightLight(null,children[i].attrs.id,false)
  }
  group = new Konva.Group({
            draggable: true
          });
  layer.add(group);
  layer.draw();
}

// 顯示滑鼠右鍵選單
function contextMenu(e: Konva.KonvaEventObject<MouseEvent>) {
  e.evt.preventDefault()

  if (e.target === stage || e.target.className == 'Image') {
    hideMenu()
    return
  }

  currentShape = e.target as Konva.Shape
  isShowBindMacros.value = currentShape.getParent() instanceof Konva.Group;
  isMacrosListVisible.value = false
  menuNode.style.display = 'initial'
  menuNode.style.left = (stage.getPointerPosition()?.x ?? 0) + 4 + 'px'
  menuNode.style.top = (stage.getPointerPosition()?.y ?? 0) + 4 + 'px'
}

// 隱藏滑鼠右鍵選單
function hideMenu() {
  menuNode.style.display = 'none'
}

function toggleMacrosList(event: MouseEvent) {
  isMacrosListVisible.value = !isMacrosListVisible.value;
  event.stopPropagation();
}

function bindLabelToMacros() {
  let shapeIndexList: number[]= [] ;
  let macroLabelInfoList: LabelInfo[]= [] ;
  group.getChildren().map((currentShape) => {
    let shapeIndex = labelInfoList.value.findIndex((ele) => {
      return ele.id == currentShape.attrs.id
    })
    if (shapeIndex !== -1) {
      shapeIndexList.push(shapeIndex)
    } 
  });
  shapeIndexList.sort((a, b) => a - b);
  shapeIndexList.forEach((index) => {
    macroLabelInfoList.push(labelInfoList.value[index])
  });

  return macroLabelInfoList
}

function bindMacros(macroName: string) {
  let macroLabelInfoList = bindLabelToMacros()
  emit('macroBind', macroName, macroLabelInfoList)
}

function deleteLabel() {
  //處理群組刪除
  if(currentShape.getParent() instanceof Konva.Group){
    var originalChildren = group.getChildren();
    var children = originalChildren.slice();
    for (var i = children.length - 1; i >= 0; i--) {
      let shapeIndex = labelInfoList.value.findIndex((ele) => {
        return ele.id == children[i].attrs.id
      })
      if (shapeIndex >= 0) {
        labelInfoList.value.splice(shapeIndex, 1)
        children[i]?.destroy()
      }
    }
  }
  //處理單一label刪除
  else {
    let shapeIndex = labelInfoList.value.findIndex((ele) => {
      return ele.id == currentShape.attrs.id
    })

    if (shapeIndex < 0) return

    labelInfoList.value.splice(shapeIndex, 1)
    currentShape?.destroy()

  }
}

function setEmptyMacros(macros?: LabelType.Macro[]) {
  emptyMacros.value = macros
}

function initStage() {
  stage = stageEle.value?.getStage() as Konva.Stage
  stage.draggable(true)
  stage.size(props)
  stage.on('wheel', mouseWheel)
  stage.on('click', mouseClick)
  stage.on('mousedown', mouseDown)
  stage.on('mousemove', mouseMove)
  stage.on('mouseup', mouseUp)
  stage.on('contextmenu', contextMenu)
  stage.on('dragend', mouseDragend)
  stage.on('dragstart', mouseDragstart)

  let stageContainer = stage.container()

  if (stageContainer.tabIndex !== 1) {
    stageContainer.tabIndex = 1
    stageContainer.addEventListener('keydown', keydown)
    stageContainer.addEventListener('keyup', keyup)
  }
}

function initContextMenu() {
  menuNode = document.getElementById('menu') as HTMLElement
  window.addEventListener('click', () => {
    hideMenu()
  })

  document.getElementById('delete-button')?.addEventListener('click', () => {
    deleteLabel()
    emit('labelRemoved')
  })
}

function initHistory() {
  let copy = (obj: any) => (obj ? JSON.parse(JSON.stringify(obj)) : obj)
  // 客製化Konva深度複製
  let copyLabelInfoList = (list: Array<LabelInfo>) => {
    return list.map((ele) => {
      let node = ele.instance
      let eleTemp = copy(ele)
      let className = node.getClassName()

      if (className == 'Circle') {
        let tempNode = node as Konva.Circle

        eleTemp.instance = new Konva.Circle({
          id: copy(node.id()),
          radius: copy(tempNode.radius()),
          fill: copy(tempNode.fill()),
          x: copy(tempNode.x()),
          y: copy(tempNode.y()),
          opacity: copy(tempNode.opacity()),
          draggable: true
        })
      } else if (className == 'Line') {
        let tempNode = node as Konva.Line

        eleTemp.instance = new Konva.Line({
          id: copy(node.id()),
          points: copy(tempNode.points()),
          stroke: copy(tempNode.stroke()),
          strokeWidth: copy(tempNode.strokeWidth()),
          lineCap: copy(tempNode.lineCap()),
          lineJoin: copy(tempNode.lineJoin()),
          x: copy(tempNode.x()),
          y: copy(tempNode.y()),
          opacity: copy(tempNode.opacity()),
          dash: copy(tempNode.dash()),
          hitStrokeWidth: copy(tempNode.hitStrokeWidth()),
          draggable: true
        })
      } else if (className == 'Rect') {
        let tempNode = node as Konva.Rect

        eleTemp.instance = new Konva.Rect({
          id: copy(node.id()),
          fill: copy(tempNode.fill()),
          width: copy(tempNode.width()),
          height: copy(tempNode.height()),
          x: copy(tempNode.x()),
          y: copy(tempNode.y()),
          opacity: copy(tempNode.opacity()),
          hitStrokeWidth: copy(tempNode.hitStrokeWidth()),
          draggable: true
        })
      }

      return eleTemp
    })
  }

  // 設定 Undo、Redo 物件
  labelInfoHistory = useManualRefHistory(labelInfoList, {
    dump: (list) => copyLabelInfoList(list),
    parse: (list) => {
      layer
        .getChildren((node) => node.getClassName() !== 'Image' 
                      && node !== selectionRectangle 
                      && node.id() !== currentLabelInfo?.id 
                      && node.id() !== previewPen?.id())
        .forEach((node) => {
          node.destroy()
        })

      let listTemp = copyLabelInfoList(list)

      listTemp.forEach((ele) => {
        if (ele.instance.className === 'Circle') {
          ele.instance.hitFunc((context, shape) => {
            context.beginPath()
            context.arc(0, 0, config.value.hitStrokeWidth / 2, 0, Math.PI * 2, true)
            context.closePath()
            context.fillStrokeShape(shape)
          })
        }

        ele.instance.on('mouseover', () => {
          heightLight(null, ele.id, true)
        })

        ele.instance.on('mouseout', () => {
          heightLight(null, ele.id, false)
        })

        return layer.add(ele.instance)
      })

      return listTemp
    }
  })
}

onMounted(() => {
  config.value = Object.assign(config.value, props.config)

  initStage()
  initContextMenu()
  initHistory()

  setPermissionList()
  layer = (layerEle.value as any)?.getNode() as Konva.Layer
  image = (imageEle.value as any)?.getNode() as Konva.Image
  layer.add(group)
  layer.add(selectionRectangle);
  resetPen()
})

const props = defineProps<Props>()

defineExpose({
  resetStage, // 清除Label
  loadImage,
  setPen,
  resetPen,
  heightLight,
  importLabel,
  restGroup,
  setMacroData,
  exportLabels,
  newExportLabels,
  setEmptyMacros,
  labelInfoList,
  imgData,
  getLabelInfoHistory,
  setPenStableColor
})

const emit = defineEmits([
  'labelAdded', // 按下增加Label事件
  'labelRemoved', // 滑鼠右鍵選單刪除Label事件
  'labelMoved' ,//拖曳圖形
  'macroAdded', //新增Macro
  'macroBind' //綁定Macro
])
</script>

<style scoped>
#menu {
  display: none;
  position: absolute;
  min-width: 60px;
  white-space: nowrap;
  background-color: rgb(18, 18, 18);
  box-shadow: 0 0 5px grey;
  border-radius: 3px;
}

#menu button {
  width: 100%;
  background-color: rgb(18, 18, 18);
  border: none;
  margin: 0;
  padding: 10px;
}

#menu button:hover {
  background-color: brown;
}

#macroSubmenu {
  min-width: 60px; /* 添加最小寬度，以確保子選單的寬度至少與父菜單相同 */
  position: absolute;
  left: 120%; /* 設置左邊距離，使子選單在父菜單右邊 */
  top: 0; /* 讓子選單與父菜單頂部對齊 */
  white-space: nowrap; /* 使文本不換行 */
  background-color: rgb(18, 18, 18); /* 設置背景顏色，使之與父選單一致 */
  box-shadow: 0 0 5px grey;
  border-radius: 3px;
}

#macroSubmenu button {
  display: block; /* 設置按鈕為塊級元素，使它們垂直堆疊 */
}
</style>
@/types/MultiLabel
