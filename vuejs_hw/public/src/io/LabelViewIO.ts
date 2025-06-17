import axios, { type AxiosResponse } from 'axios'

import '@/io'

import type { LabelType } from '@/types/Label'
import type { ResponseBase } from '@/types/Base'

export async function findLastImageInfo(
  userId: string,
  time?: number
): Promise<AxiosResponse<LabelType.ImageDataResponse>> {
  return await axios.get('/api/labeling/find_last_img', {
    params: {
      userId: userId,
      time: time
    }
  })
}

export async function getPreviousImageInfo(
  userId: string,
  vorInputId?: number,
  time?: number,
  lotId?: string,
  isAuto?: string
): Promise<AxiosResponse<LabelType.ImageDataResponse>> {
  return await axios.get('/api/labeling/get_previous_img', {
    params: {
      userId: userId,
      vorInputId: vorInputId,
      time: time,
      lotId: lotId,
      isAuto: isAuto
    }
  })
}

export async function getNextImageInfo(
  userId: string,
  vorInputId?: number,
  time?: number,
  lotId?: string,
  isAuto?: string
): Promise<AxiosResponse<LabelType.ImageDataResponse>> {
  return await axios.get('/api/labeling/get_next_img', {
    params: {
      userId: userId,
      vorInputId: vorInputId,
      time: time,
      lotId: lotId,
      isAuto: isAuto
    }
  })
}

export async function getSettings() {
  return await axios.get('/api/labeling/get_set_info')
}

export async function saveSettings(settings: any, userId: string) {
  settings.userId = userId
  return await axios.post('/api/labeling/save_set_info', settings)
}

export async function saveLabelInfo(
  labelInfo: LabelType.LabelInfoRequest
): Promise<AxiosResponse<ResponseBase>> {
  return await axios.post('/api/labeling/save_label_result', labelInfo)
}

export async function getPermission() {
  return await axios.get('/api/permission/get_permission_info')
}

export async function savePermission(permissionProfile: any, userId: string) {
  permissionProfile.userId = userId
  return await axios.post('/api/permission/save_permission_info', permissionProfile)
}

export async function getWipList(time?: number) {
  return await axios.get('/api/wip/get_wip_list', {
    params: {
      time: time
    }
  })
}

export default {
  findLastImageInfo,
  getPreviousImageInfo,
  getNextImageInfo,
  getSettings,
  saveSettings,
  saveLabelInfo,
  getPermission,
  savePermission,
  getWipList
}
