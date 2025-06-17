<template>
  <el-row>
    <el-col :span="1.5">
      <el-row justify="center">
        <el-col :span="10">
          <el-text style="font-size: 30px">VOR</el-text>
        </el-col>
      </el-row>

      <el-row style="width: 180px" class="vor-border-line">
        <el-col>
          <el-row>
            <el-col :span="11">
              <el-button
                @click="
                  () => {
                    isShowSearchLotId = false
                    searchLotId = ''
                  }
                "
                type="primary"
                class="vor-btn"
              >
                Default
              </el-button>
            </el-col>
            <el-col :span="2"> </el-col>
            <el-col :span="11">
              <el-button
                @click="
                  () => {
                    isShowSearchLotId = true
                    searchLotId = ''
                  }
                "
                type="primary"
                class="vor-btn"
              >
                Lot ID
              </el-button>
            </el-col>
          </el-row>
          <el-row v-if="isShowSearchLotId">
            <el-col>
              <el-input v-model="searchLotId" placeholder="Lot ID" />
            </el-col>
          </el-row>
          <el-row v-if="isShowSearchLotId" justify="space-between">
            <el-col>
              <el-button
                @click="getImageInfo('next','search')"
                :disabled="!settings"
                type="primary"
                :icon="Search"
                class="vor-btn"
              >
                Search
              </el-button>
            </el-col>
          </el-row>
        </el-col>
      </el-row>

      <el-row class="vor-border-line">
        <el-col>
          <el-text style="font-size: 20px; margin-right: 20px">VOR 判圖</el-text>
          <br />
          <el-radio-group id="ele_id_isAuto" v-model="isAuto" size="small">
            <el-radio-button :disabled="true" label="true" key="true">Auto</el-radio-button>
            <el-radio-button label="false" key="false">Manual<br />/Semi</el-radio-button>
            <el-radio-button :disabled="true" label="" key="">不篩選</el-radio-button>
          </el-radio-group>
        </el-col>
      </el-row>

      <el-row class="vor-border-line">
        <el-col>
          <el-row>
            <el-col>
              <el-button
                @click="
                  () => {
                    opModeSwitch('training')
                  }
                "
                :type="opMode == 'training' ? 'success' : 'primary'"
                :disabled="!readyForLabeling || trainingLabel != null"
                :icon="Crop"
                class="vor-btn"
              >
                Label
                <br />
                Mode
              </el-button>
            </el-col>
          </el-row>
        </el-col>
      </el-row>

      <el-row style="width: 180px ; margin-bottom:0px">
        <el-col class="vor-border-line">
          <el-row>
            <el-col>
              <el-button
                @click="
                  () => {
                    historyUndo()
                  }
                "
                :disabled="!readyForLabeling || !ml?.getLabelInfoHistory().canUndo.value"
                type="primary"
                :icon="RefreshLeft"
                class="vor-btn"
                >Undo</el-button
              >
            </el-col>
          </el-row>
          <el-row>
            <el-col>
              <el-button
                @click="
                  () => {
                    historyRedo()
                  }
                "
                :disabled="!readyForLabeling || !ml?.getLabelInfoHistory().canRedo.value"
                type="primary"
                :icon="RefreshRight"
                class="vor-btn"
                >Redo</el-button
              >
            </el-col>
          </el-row>
          <el-row>
            <el-col>
              <el-button
                @click="getImageInfo('previous','transfer')"
                :disabled="!settings"
                type="primary"
                :icon="ArrowLeft"
                class="vor-btn"
                >Prev</el-button
              >
            </el-col>
          </el-row>
          <el-row>
            <el-col>
              <el-button
                @click="getImageInfo('next','transfer')"
                :disabled="!settings"
                type="primary"
                :icon="ArrowRight"
                class="vor-btn"
                >Next</el-button
              >
            </el-col>
          </el-row>
          <!-- <el-row>
        <el-col>
          <el-button
            @click="
              () => {
                console.log(
                  operationInfoHistory.history.value,
                  ml?.getLabelInfoHistory().history.value
                )
              }
            "
            type="primary"
            class="vor-btn"
            >Test</el-button
          >
        </el-col>
      </el-row> -->
          <el-row>
            <el-col>
              <el-button @click="showTempImgSelector" type="info" class="vor-btn">
                Select Image <br />
                [only for demo]</el-button
              >
              <input id="tempImgFile" type="file" style="display: none" />
            </el-col>
          </el-row>
        </el-col>
      </el-row>

      <el-row style="width: 180px; margin-top:0px">
        <el-col class="vor-border-line">
          <el-text style="font-size: 20px; margin-right: 20px">Macro Select</el-text>
          <el-col class="vor-border-line">
            <el-row>
              <el-col>
                <el-button
                  @click="isShowMacroList = true"
                  :disabled="!settings"
                  type="primary"
                  class="vor-btn"
                  >展開</el-button
                >
              </el-col>
            </el-row>
          </el-col>
          <el-row
            v-for="item in macros?.filter((ele) => ele.isHotKey)"
            :key="item.name"
          >
            <el-button
              @click="createMacroLabel(item.name)"
              type="primary"
              class="vor-btn"
            >
              {{ item.name }}
            </el-button>
          </el-row>
          
        </el-col>
      </el-row>
    </el-col>

    <!-- 中間 -->
    <el-col :span="15">
      <el-row class="vor-border-line" justify="center">
        <el-col>
          <MultiLabel
            ref="ml"
            @labelAdded="labelAdded"
            @labelRemoved="labelRemoved"
            @labelMoved="labelMoved"
            @macroAdded="macroAdded"
            @macroBind="macroBind"
            :config="{}"
            :width="1180"
            :height="830"
          ></MultiLabel>
        </el-col>
      </el-row>

      <el-row class="vor-border-line">
        <el-col>
          <!-- <el-row justify="center">
            <el-text>圖片資訊</el-text>
          </el-row> -->
          <el-row>
            <el-col :span="3">
              <el-row>
                <el-col>
                  <el-text>Lot ID</el-text>
                </el-col>
              </el-row>
              <el-row>
                <el-col>
                  <el-text>{{ imgInfo?.lotId }}</el-text>
                </el-col>
              </el-row>
            </el-col>
            <el-col :span="3">
              <el-row>
                <el-col>
                  <el-text>Chip ID</el-text>
                </el-col>
              </el-row>
              <el-row>
                <el-col>
                  <el-text>{{ imgInfo?.chipId }}</el-text>
                </el-col>
              </el-row>
            </el-col>
            <el-col :span="3">
              <el-row>
                <el-col>
                  <el-text>Signal No</el-text>
                </el-col>
              </el-row>
              <el-row>
                <el-col>
                  <el-text>{{ imgInfo?.dataAx }}</el-text>
                </el-col>
              </el-row>
            </el-col>
            <el-col :span="3">
              <el-row>
                <el-col>
                  <el-text>Gate No</el-text>
                </el-col>
              </el-row>
              <el-row>
                <el-col>
                  <el-text>{{ imgInfo?.gateAx }}</el-text>
                </el-col>
              </el-row>
            </el-col>
            <el-col :span="2">
              <el-row>
                <el-col>
                  <el-text>Dft Mode</el-text>
                </el-col>
              </el-row>
              <el-row>
                <el-col>
                  <el-text>{{ imgInfo?.dftMode }}</el-text>
                </el-col>
              </el-row>
            </el-col>
            <el-col :span="3">
              <el-row>
                <el-col>
                  <el-text>Tool ID</el-text>
                </el-col>
              </el-row>
              <el-row>
                <el-col>
                  <el-text>{{ imgInfo?.toolId }}</el-text>
                </el-col>
              </el-row>
            </el-col>
            <el-col :span="2">
              <el-row>
                <el-col>
                  <el-text>Tester</el-text>
                </el-col>
              </el-row>
              <el-row>
                <el-col>
                  <el-text>{{ imgInfo?.tester }}</el-text>
                </el-col>
              </el-row>
            </el-col>
            <el-col :span="2">
              <el-row>
                <el-col>
                  <el-text>RGB</el-text>
                </el-col>
              </el-row>
              <el-row>
                <el-col>
                  <el-text>{{ imgInfo?.rgb }}</el-text>
                </el-col>
              </el-row>
            </el-col>
            <el-col :span="2">
              <el-row>
                <el-col>
                  <el-text>Ratio</el-text>
                </el-col>
              </el-row>
              <el-row>
                <el-col>
                  <el-text>{{ imgInfo?.ratio }}</el-text>
                </el-col>
              </el-row>
            </el-col>
            <el-col :span="1">
              <el-row>
                <el-col style="text-align: end">
                  <Tickets
                    @click="isShowSheetInfoList = true"
                    v-if="imgData && imgData.sheetInfoList && imgData.sheetInfoList.length > 0"
                    style="width: 30px; cursor: pointer"
                  />
                </el-col>
              </el-row>
            </el-col>
          </el-row>
        </el-col>
      </el-row>
    </el-col>

    <!-- 右側 -->
    <el-col :span="6">
      <!-- User工號、登出鍵... -->
      <el-row class="vor-border-line" style="border: 0px" justify="end">
        <el-col :span="6">
          <el-text style="font-size: larger">{{ userInfoStore.userId.value }}</el-text>
        </el-col>
        <el-col :span="1">
          <el-text style="font-size: larger">|</el-text>
        </el-col>
        <el-tooltip effect="dark" content="Label List" placement="bottom">
          <el-col :span="2">
            <el-button
              @click="isShowLabelList = true"
              :text="true"
              size="small"
              :icon="Fold"
              circle
            ></el-button>
          </el-col>
        </el-tooltip>
        
        <el-tooltip effect="dark" content="Wip List" placement="bottom">
          <el-col :span="2">
            <i class="el-icon-delete"></i>
            <el-button
              @click="isShowWipList = true"
              :text="true"
              size="small"
              :icon="Memo"
              circle
            ></el-button>
          </el-col>
        </el-tooltip>
        <el-col :span="1">
          <el-text style="font-size: larger">|</el-text>
        </el-col>
        <el-tooltip effect="dark" content="Setting" placement="bottom">
          <el-col :span="2">
            <el-button
              @click="isShowSetting = true"
              :text="true"
              size="small"
              :icon="Setting"
              circle
            ></el-button>
          </el-col>
        </el-tooltip>
        <el-tooltip effect="dark" content="Permission" placement="bottom">
          <el-col :span="3">
            <el-button
              :disabled = "userInfoStore.groupName.value!= 'Admin'"
              @click="isShowPermissionProfileSetting = true"
              :text="true"
              size="small"
              :icon="Avatar"
              circle
            ></el-button>
          </el-col>
        </el-tooltip>
        <el-tooltip effect="dark" content="logout" placement="bottom">
          <el-col :span="1">
            <el-button
              @click="logout"
              :text="true"
              size="small"
              :icon="SwitchButton"
              circle
            ></el-button>
          </el-col>
        </el-tooltip>
      </el-row>

      <!-- Repair Pen -->
      <el-row class="vor-border-line">
        <el-col class="vor-border-line" :span="7">
          <el-row> Line </el-row>
          <el-row>
            <el-select
              v-model="selectLineCondition"
              @change="
                (val: string) => {
                  switchPen('line')
                  setCondition(val)
                  selectLineCondition = val
                }
              "
              :disabled="!readyForLabeling"
              size="small"
              placeholder="Select"
            >
              <el-option
                v-for="item in combo?.lineConditions"
                :key="item.condition"
                :label="item.condition"
                :value="item.condition"
              />
              <el-option label="" value="" />
            </el-select>
          </el-row>
          <el-row
            v-for="item in combo?.lineConditions.filter((ele) => ele.isHotKey)"
            :key="item.condition"
          >
            <el-button
              @click="
                () => {
                  switchPen('line')
                  setCondition(item.condition)
                  selectLineCondition = item.condition
                }
              "
              :disabled="!readyForLabeling"
              size="small"
              type="primary"
              class="vor-btn"
            >
              {{ item.condition }}
            </el-button>
          </el-row> </el-col
        ><el-col class="vor-border-line" :span="7">
          <el-row> Block </el-row>
          <el-row>
            <el-select
              v-model="selectBlockCondition"
              @change="
                (val: string) => {
                  switchPen('block')
                  setCondition(val)
                  selectBlockCondition = val
                }
              "
              :disabled="!readyForLabeling"
              size="small"
              placeholder="Select"
            >
              <el-option
                v-for="item in combo?.blockConditions"
                :key="item.condition"
                :label="item.condition"
                :value="item.condition"
              />
              <el-option label="" value="" />
            </el-select>
          </el-row>
          <el-row
            v-for="item in combo?.blockConditions.filter((ele) => ele.isHotKey)"
            :key="item.condition"
          >
            <el-button
              @click="
                () => {
                  switchPen('block')
                  setCondition(item.condition)
                  selectBlockCondition = item.condition
                }
              "
              :disabled="!readyForLabeling"
              size="small"
              type="primary"
              class="vor-btn"
            >
              {{ item.condition }}
            </el-button>
          </el-row> </el-col
        ><el-col class="vor-border-line" :span="8">
          <el-row> Point </el-row>
          <el-row>
            <el-select
              v-model="selectPointCondition"
              @change="
                (val: string) => {
                  switchPen('point')
                  setCondition(val)
                  selectBlockCondition = val
                }
              "
              :disabled="!readyForLabeling"
              size="small"
              placeholder="Select"
            >
              <el-option
                v-for="item in combo?.pointConditions"
                :key="item.condition"
                :label="item.condition"
                :value="item.condition"
              />
              <el-option label="" value="" />
            </el-select>
          </el-row>
          <el-row
            v-for="item in combo?.pointConditions.filter((ele) => ele.isHotKey)"
            :key="item.condition"
          >
            <el-button
              @click="
                () => {
                  switchPen('point')
                  setCondition(item.condition)
                  selectPointCondition = item.condition
                }
              "
              :disabled="!readyForLabeling"
              size="small"
              type="primary"
              class="vor-btn"
            >
              {{ item.condition }}
            </el-button>
          </el-row>
        </el-col>
      </el-row>

      <el-row class="vor-border-line">
        <el-table :data="imgData?.sheetInfoList" border height="150" style="width: 100%; font-size: 8px" id="sheet_info_table">
          <el-table-column label="No." type="index" width="30px"/>
          <el-table-column label="Chip ID" width="50px" >
            <template #default="scope">
              <div :style="isCurrentSheetInfo(scope.row) ? { color: 'chartreuse' } : {}" >
                {{ scope.row.chipId }}
              </div>
            </template>
          </el-table-column>
          <el-table-column label="Signal No" width="60px">
            <template #default="scope">
              <div :style="isCurrentSheetInfo(scope.row) ? { color: 'chartreuse' } : {}">
                {{ scope.row.dataAx }}
              </div>
            </template>
          </el-table-column>
          <el-table-column label="Gate No" width="40px">
            <template #default="scope">
              <div :style="isCurrentSheetInfo(scope.row) ? { color: 'chartreuse' } : {}">
                {{ scope.row.gateAx }}
              </div>
            </template>
          </el-table-column>
          <el-table-column label="Dft Mode" width="40px">
            <template #default="scope">
              <div :style="isCurrentSheetInfo(scope.row) ? { color: 'chartreuse' } : {}">
                {{ scope.row.dftMode }}
              </div>
            </template>
          </el-table-column>
          <el-table-column label="RPFlag" width="40px">
            <template #default="scope">
              <div :style="isCurrentSheetInfo(scope.row) ? { color: 'chartreuse' } : {}">
                {{ scope.row.rpFlag }}
              </div>
            </template>
          </el-table-column>
          <el-table-column label="LSRJudge" width="40px">
            <template #default="scope">
              <div :style="isCurrentSheetInfo(scope.row) ? { color: 'chartreuse' } : {}">
                {{ scope.row.lsrJudge }}
              </div>
            </template>
          </el-table-column>
          <el-table-column label="Tester" width="40px">
            <template #default="scope">
              <div :style="isCurrentSheetInfo(scope.row) ? { color: 'chartreuse' } : {}">
                {{ scope.row.tester }}
              </div>
            </template>
          </el-table-column>
          <el-table-column label="RGB" width="40px">
            <template #default="scope">
              <div :style="isCurrentSheetInfo(scope.row) ? { color: 'chartreuse' } : {}">
                {{ scope.row.rgb }}
              </div>
            </template>
          </el-table-column>
          <el-table-column label="Ratio" width="40px">
            <template #default="scope">
              <div :style="isCurrentSheetInfo(scope.row) ? { color: 'chartreuse' } : {}">
                {{ scope.row.ratio }}
              </div>
            </template>
          </el-table-column>
          <el-table-column label="Retype" width="60px">
            <template #default="scope">
              <div :style="isCurrentSheetInfo(scope.row) ? { color: 'chartreuse' } : {}">
                {{ scope.row.retype }}
              </div>
            </template>
          </el-table-column>
          <el-table-column label="Lot ID" width="50px">
            <template #default="scope">
              <div :style="isCurrentSheetInfo(scope.row) ? { color: 'chartreuse' } : {}">
                {{ scope.row.lotId }}
              </div>
            </template>
          </el-table-column>
          <el-table-column label="Tool ID" width="50px">
            <template #default="scope">
              <div :style="isCurrentSheetInfo(scope.row) ? { color: 'chartreuse' } : {}">
                {{ scope.row.toolId }}
              </div>
            </template>
          </el-table-column>
        </el-table>
      </el-row>

      <!-- Retype -->
      <el-row class="vor-border-line">
        <el-col>
          <el-text style="font-size: 20px">Retype</el-text>
          <el-row>
            <el-col :span="11" style="height: auto;">
              <el-row class="vor-border-line">
                <el-scrollbar max-height="100px">
                  <el-radio-group
                    :disabled="!readyForLabeling"
                    v-model="operationInfo.retypeCatgory"
                    size="small"
                  >
                    <el-radio
                      v-for="item in settings?.retype"
                      :label="item.value"
                      :key="item.value"
                      style="width: 150px"
                    >
                      {{ item.value }}
                    </el-radio>
                  </el-radio-group>
                </el-scrollbar>
              </el-row>

              <!-- LCV -->
              <el-row class="vor-border-line">
                <el-col>
                  <el-text style="font-size: 20px">LCV</el-text>
                  <el-select
                    id="lcvSelector"
                    :disabled="!readyForLabeling"
                    @change="
                      (val: string) => {
                        if (!val) return
                        operationInfo.addLcvDftMode.push(val)
                        // historyCommit()
                        motifyData()
                      }
                    "
                    size="small"
                    placeholder="Select"
                    style="padding: 0px 5px"
                  >
                    <el-option class="lcvOption"
                      v-for="item in settings?.lcv"
                      :key="item.value"
                      :label="item.value"
                      :value="item.value"
                    />
                    <el-option label="" value="" />
                  </el-select>
                  <el-row class="vor-border-line" style="height: 80px ">
                    <el-col>
                      <el-scrollbar max-height="70px">
                        <template v-for="(item, index) in operationInfo.addLcvDftMode" :key="index">
                          <el-button
                            @click="
                              () => {
                                operationInfo.addLcvDftMode.splice(index, 1)
                                // historyCommit()
                                motifyData()
                              }
                            "
                            size="small"
                            type="primary"
                            class="vor-btn"
                            style="margin-bottom: 5px"
                          >
                            {{ item }}
                          </el-button>
                          <br />
                        </template>
                      </el-scrollbar>
                    </el-col>
                  </el-row>
                </el-col>
              </el-row>
            </el-col>
            <!-- <el-col :span="1"></el-col> -->
            <el-col :span="12" class="vor-border-line" style="height:auto">
              <el-scrollbar max-height="240px">
                <el-radio-group
                  @change="
                    () => {
                      motifyData()
                      // historyCommit()
                    }
                  "
                  :disabled="!readyForLabeling"
                  v-model="operationInfo.retype"
                  size="small"
                >
                  <el-radio
                    v-for="item in settings?.retype.find(
                      (ele) => ele.value == operationInfo.retypeCatgory
                    )?.subs || []"
                    :label="item.value"
                    :key="item.value"
                    style="width: 150px"
                  >
                    {{ item.value }}
                  </el-radio>
                </el-radio-group>
              </el-scrollbar>
            </el-col>
          </el-row>
        </el-col>
      </el-row>

      <el-row style="height: 75px" class="vor-border-line">
        <el-col :span="3">
          <el-text style="font-size: 12px">LSR Judge</el-text>
          <br />
          <el-button
            :disabled="!readyForLabeling"
            @click="switchLsrJudge"
            class="vor-btn"
            type="primary"
          >{{ operationInfo.lsrJudgeColletion.toUpperCase() }}</el-button>
        </el-col>
        <el-col :span="21" style="padding-left: 5px; padding-right: 0px">
          <el-radio-group :disabled="!readyForLabeling" v-model="operationInfo.lsrJudge">
            <el-radio
              @change="
                () => {
                  // historyCommit()
                  motifyData()
                }
              "
              v-for="item in settings?.lsrJudge.find(
                (ele) => ele.value == operationInfo.lsrJudgeColletion
              )?.subs.filter((sub) => sub.isHotKey === true)"
              :label="item.value"
              :key="item.value"
              style="margin-bottom: -15px"
            ></el-radio>
            <el-select
              :disabled="!readyForLabeling"
              @change="
                (val: string) => {
                  if (!val) return
                  operationInfo.lsrJudge = val
                  // historyCommit()
                  motifyData()
                }
              "
              size="small"
              placeholder="Select"
              v-model="operationInfo.lsrJudge"
              style="margin-bottom: -15px;width: 100px; display: flex; align-items: center;"
            >
              <el-option 
                v-for="item in settings?.lsrJudge.find(
                          (ele) => ele.value == operationInfo.lsrJudgeColletion
                        )?.subs"
                        :key="item.value"
                        :label="item.value"
                        :value="item.value"
              />
              <!-- 添加一個空選項 -->
              <el-option label="" value="" />
            </el-select> 
          </el-radio-group>
        </el-col>
      </el-row>

      <el-row>
        <!-- RP FLAG -->
        <el-col :span="4.5" class="vor-border-line">
          <el-text style="font-size: 20px; margin-right: 20px">RP Flag</el-text>
          <el-select
            v-model="operationInfo.rpFlag"
            @change="
              () => {
                rpFlagChanged()
                // historyCommit()
                motifyData()
              }
            "
            :disabled="!readyForLabeling"
            size="small"
            placeholder="Select"
          >
            
            <el-option
              v-for="item in settings?.rpFlag"
              :key="item.value"
              :label="item.name"
              :value="item.value"
            />
            <el-option label="" value="" />
          </el-select>
          <br />

          <el-radio-group
            v-model="operationInfo.rpFlag"
            @change="
              () => {
                rpFlagChanged()
                // historyCommit()
                motifyData()
              }
            "
            :disabled="!readyForLabeling"
            style="margin-top: 5px"
            size="large"
          >
            <el-radio-button
              v-for="ele in settings?.rpFlag.filter((item) => item.isHotKey)"
              :label="ele.value"
              :key="ele.value"
              >{{ ele.name }}</el-radio-button
            >
          </el-radio-group>
        </el-col>

        <!-- SAVE -->
        <el-col :span="4.5" class="vor-border-line">
          <el-text style="font-size: 20px">SAVE</el-text>
          <br />
          <el-button
            :disabled="!readyForLabeling"
            @click="save"
            type="primary"
            :icon="Document"
            class="vor-btn"
          ></el-button>
        </el-col>
      </el-row>
    </el-col>
  </el-row>

  <!-- Label List drawer -->
  <el-drawer v-model="isShowLabelList" title="Label List" size="20%" direction="rtl">
    <el-row class="vor-border-line">
      <el-col>
        <el-row align="middle">
          <el-col :span="20">
            <el-button
              @click="labelListVisibleSwitch()"
              :disabled="!readyForLabeling"
              size="small"
              type="primary"
              :icon="Switch"
            ></el-button>
          </el-col>
          <el-col :span="4">
            <el-button
              @click="deleteAllLabel"
              :disabled="!readyForLabeling"
              size="small"
              type="danger"
              :icon="Delete"
            ></el-button>
          </el-col>
        </el-row>
        <el-row>
          <el-col>
            <ul class="infinite-list" style="overflow: auto; height:750px" v-if="ml && ml.labelInfoList != null">
              <li
                v-for="(label, i) in ml.labelInfoList"
                :key="i"
                class="infinite-list-item vor-border-line --el-bg-color"
                v-show = "label.type == 'training'"
              >
                <el-row>
                  <el-col :span="2">
                    <el-text>0</el-text>
                  </el-col>
                  <el-col :span="6">
                    <el-text>alignment</el-text>
                  </el-col>
                </el-row>
                <el-row>
                  <el-col :span="4">
                    <el-button
                      @click="heightLight(label as LabelInfo)"
                      size="small"
                      :icon="Sunny"
                      circle
                    />
                  </el-col>
                  <el-col :span="4">
                    <el-button
                      @click="labelListVisibleSwitch(label as LabelInfo)"
                      size="small"
                      :icon="label.instance.visible() ? View : Hide"
                      circle
                    />
                  </el-col>
                  <el-col :span="12"> </el-col>
                  <el-col :span="3">
                    <el-button
                      @click="deleteLabel(label as LabelInfo)"
                      size="small"
                      :icon="Delete"
                      circle
                    />
                  </el-col>
                </el-row>
              </li>
              <VueDraggable v-model="ml.labelInfoList" class="infinite-list" style="overflow: auto; height: auto ">
                <li
                  v-for="(label, i) in ml.labelInfoList"
                  :key="i"
                  class="infinite-list-item vor-border-line --el-bg-color"
                  v-show = "label.type !== 'training'"
                >
                  <el-row>
                    <el-col :span="2">
                      <el-text>{{ ml.labelInfoList.some((label: LabelInfo) => label.type === 'training') ? i : i + 1 }}</el-text>
                    </el-col>
                    <el-col :span="6">
                      <el-text>{{ label.type == 'training' ? 'alignment' : label.type }}</el-text>
                    </el-col>
                    <el-col v-show="label.type != 'training'" :span="16">
                      <el-row>
                        <el-col>
                          <el-text>{{ label.ext.condition }}</el-text>
                        </el-col>
                      </el-row>
                    </el-col>
                  </el-row>
                  <el-row>
                    <el-col :span="4">
                      <el-button
                        @click="heightLight(label as LabelInfo)"
                        size="small"
                        :icon="Sunny"
                        circle
                      />
                    </el-col>
                    <el-col :span="4">
                      <el-button
                        @click="labelListVisibleSwitch(label as LabelInfo)"
                        size="small"
                        :icon="label.instance.visible() ? View : Hide"
                        circle
                      />
                    </el-col>
                    <el-col :span="12"> </el-col>
                    <el-col :span="3">
                      <el-button
                        @click="deleteLabel(label as LabelInfo)"
                        size="small"
                        :icon="Delete"
                        circle
                      />
                    </el-col>
                  </el-row>
                </li>
              </VueDraggable>
            </ul>
          </el-col>
        </el-row>
      </el-col>
    </el-row>
  </el-drawer>

  <!-- Macro List drawer -->
  <el-drawer v-model="isShowMacroList" title="Macro List" size="10%" direction="ltr" :modal="false" :lock-scroll="false" style="padding:1px">
    <ul class="infinite-list" style="overflow: auto; height:800px" >
      <el-row
        v-for="item in macros"
        :key="item.name"
      >
        <el-button
          @click="createMacroLabel(item.name),
                  isShowMacroList = false"
          type="primary"
          class="vor-btn"
        >
          {{ item.name }}
        </el-button>
      </el-row>
    </ul>
  </el-drawer>

  <!-- WipList Dialog -->
  <WipList 
    @close="WipListClosed" 
    @searchImgData="searchImgData" 
    :is-show="isShowWipList"
    :query-hours="queryHours">
  </WipList>

  <!-- Setting Dialog -->
  <PermissionProfile @save="PermissionProfileSaved" @close="PermissionProfileClosed" :is-show="isShowPermissionProfileSetting">
  </PermissionProfile>

  <!-- Setting Dialog -->
  <UserSettings @save="userSettingsSaved" @close="userSettingsClosed" :is-show="isShowSetting">
  </UserSettings>

  <!-- Sheet Info List Dialog -->
  <el-dialog v-model="isShowSheetInfoList" :is-show="isShowSheetInfoList" width="1650px">
    <el-table :data="imgData?.sheetInfoList" style="width: 100%" max-height="400">
      <el-table-column label="No." type="index" width="100px"/>
      <el-table-column label="Lot ID" width="120px">
        <template #default="scope">
          <div :style="isCurrentSheetInfo(scope.row) ? { color: 'chartreuse' } : {}">
            {{ scope.row.lotId }}
          </div>
        </template>
      </el-table-column>
      <el-table-column label="Chip ID" width="150px">
        <template #default="scope">
          <div :style="isCurrentSheetInfo(scope.row) ? { color: 'chartreuse' } : {}">
            {{ scope.row.chipId }}
          </div>
        </template>
      </el-table-column>
      <el-table-column label="Signal No" width="120px">
        <template #default="scope">
          <div :style="isCurrentSheetInfo(scope.row) ? { color: 'chartreuse' } : {}">
            {{ scope.row.dataAx }}
          </div>
        </template>
      </el-table-column>
      <el-table-column label="Gate No" width="120px">
        <template #default="scope">
          <div :style="isCurrentSheetInfo(scope.row) ? { color: 'chartreuse' } : {}">
            {{ scope.row.gateAx }}
          </div>
        </template>
      </el-table-column>
      <el-table-column label="Dft Mode" width="120px">
        <template #default="scope">
          <div :style="isCurrentSheetInfo(scope.row) ? { color: 'chartreuse' } : {}">
            {{ scope.row.dftMode }}
          </div>
        </template>
      </el-table-column>
      <el-table-column label="RPFlag" width="120px">
        <template #default="scope">
          <div :style="isCurrentSheetInfo(scope.row) ? { color: 'chartreuse' } : {}">
            {{ scope.row.rpFlag }}
          </div>
        </template>
      </el-table-column>
      <el-table-column label="LSRJudge" width="120px">
        <template #default="scope">
          <div :style="isCurrentSheetInfo(scope.row) ? { color: 'chartreuse' } : {}">
            {{ scope.row.lsrJudge }}
          </div>
        </template>
      </el-table-column>
      <el-table-column label="Tool ID" width="120px">
        <template #default="scope">
          <div :style="isCurrentSheetInfo(scope.row) ? { color: 'chartreuse' } : {}">
            {{ scope.row.toolId }}
          </div>
        </template>
      </el-table-column>
      <el-table-column label="Tester" width="120px">
        <template #default="scope">
          <div :style="isCurrentSheetInfo(scope.row) ? { color: 'chartreuse' } : {}">
            {{ scope.row.tester }}
          </div>
        </template>
      </el-table-column>
      <el-table-column label="RGB" width="120px">
        <template #default="scope">
          <div :style="isCurrentSheetInfo(scope.row) ? { color: 'chartreuse' } : {}">
            {{ scope.row.rgb }}
          </div>
        </template>
      </el-table-column>
      <el-table-column label="Ratio" width="120px">
        <template #default="scope">
          <div :style="isCurrentSheetInfo(scope.row) ? { color: 'chartreuse' } : {}">
            {{ scope.row.ratio }}
          </div>
        </template>
      </el-table-column>
      <el-table-column label="Retype" width="120px">
        <template #default="scope">
          <div :style="isCurrentSheetInfo(scope.row) ? { color: 'chartreuse' } : {}">
            {{ scope.row.retype }}
          </div>
        </template>
      </el-table-column>
    </el-table>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed, onBeforeUnmount, watch } from 'vue'
import { useManualRefHistory } from '@vueuse/core'
import {
  RefreshLeft,
  RefreshRight,
  Tickets,
  Crop,
  ArrowLeft,
  ArrowRight,
  Document,
  Setting,
  SwitchButton,
  Search,
  Fold,
  Delete,
  Sunny,
  Switch,
  View,
  Hide,
  Avatar,
  Memo
} from '@element-plus/icons-vue'

import { useUserInfoStore } from '@/stores/userInfo'

import { LabelInfo } from '@/components/LabelView/MultiLabel'
import type { MultiLabelInterface } from '@/types/MultiLabel'

import LabelViewIO from '@/io/LabelViewIO'
import { type LabelType } from '@/types/Label.d'
import { ElMessage, ElMessageBox } from 'element-plus'
import { VueDraggable } from 'vue-draggable-plus'

const userInfoStore = useUserInfoStore()
userInfoStore.checkLoginStateAndRouting()

const logout = async () => {
  await userInfoStore.logout()
  sessionStorage.clear()
  userInfoStore.checkLoginStateAndRouting()
}
// 是否顯示 User Setting
const isShowSetting = ref(false)
// 是否顯示 Sheet Info List
const isShowSheetInfoList = ref(false)

// 操作模式 (repair、training)
const opMode = ref('')
// Label Pen 狀態 (point、line、block)
const penType = ref('point')
// 儲存後端回應的 User Settings 資訊
const settings = ref<LabelType.Setting>()
// 目前圖片的產品對應的 combo
const combo = ref<LabelType.ConditionCombo | undefined | null>(null)
// 目前選擇的 Pen Condition 列表
const conditions = ref<LabelType.Condition[]>([])
// 目前選擇的 Macro 列表
const macros = ref<LabelType.Macro[]| undefined | null>(null)
// 目前選擇的 Condition 代號
const selectCondition = ref('')
// Point 下拉選單的選擇值
const selectPointCondition = ref('')
// Line 下拉選單的選擇值
const selectLineCondition = ref('')
// Block 下拉選單的選擇值
const selectBlockCondition = ref('')
// 是否顯示 Search Lot ID
const isShowSearchLotId = ref(false)
// 要 Search 的 Lot ID
const searchLotId = ref('')
// 是否顯示 Label List
const isShowLabelList = ref(false)
// isAuto 查詢條件 (''、'true'、'false')
const isAuto = ref('false')
// 使用者是否有變更 Label 資訊
const isMotifyAndNotSave = ref(false)
// 是否顯示 Macro List
const isShowMacroList = ref(false)
// 是否顯示 PermissionProfile List
const isShowPermissionProfileSetting = ref(false)
// 是否顯示 WipList
const isShowWipList = ref(false)
// WipList的queryHours
const queryHours = ref(0)
// Multi Label Component 的物件實體
const ml = ref<MultiLabelInterface | null>(null)

// Next、Previous 回應的完整物件 (包含 imgPath、imgInfo、labelInfo、judgeInfo、sheetInfoList)
const imgData = ref<LabelType.ImageDataResponse | null>(null)
// Next、Previous 回應的 imgInfo 物件
const imgInfo = ref<LabelType.ImgInfo | undefined | null>(null)

// 目前 Repair Label 的列表
const repairLabelList = ref(computed(() => ml.value?.labelInfoList))
// 目前的 Traning Label
const trainingLabel = computed(
  () => ml.value?.labelInfoList.find((ele: any) => ele.type == 'training')
)
// 確定圖片資訊是否夠完整，已可以開始Label
const readyForLabeling = computed(
  () => combo.value != null && settings.value != null && imgData.value?.imgInfo?.vorInputId
)
// LSR Judge 列表的分類
const lsrJudgeColletionList = computed(() =>
  settings.value != null && settings.value.lsrJudge != null
    ? settings.value.lsrJudge.map((i) => i.value)
    : []
)
// 判 Code 資訊
const operationInfo = ref({
  retypeCatgory: '',
  retype: '',
  lsrJudgeColletion: '',
  addLcvDftMode: [] as string[],
  lsrJudge: '',
  rpFlag: ''
})
// Label 歷史紀錄
const operationInfoHistory = useManualRefHistory(operationInfo, { clone: true })
// 判斷是否初始化
const isInitialized = ref(false)

watch(isShowSearchLotId, (newVal) => {
  sessionStorage.setItem('isShowSearchLotId', newVal.toString())
}, { deep: true })
watch(searchLotId, (newVal) => {
  sessionStorage.setItem('searchLotId', newVal)
}, { deep: true })
watch(isShowSetting, () => {
  sessionStorage.setItem('isShowSetting', isShowSetting.value.toString())
}, { deep: true })
watch(isShowLabelList, () => {
  ml.value?.restGroup();
}, { deep: true })

watch(operationInfo.value, (newVal) => {
  const imgData = sessionStorage.getItem('imgData');
  if (imgData !== null) {
    const imgDataObj = JSON.parse(imgData);
    imgDataObj.judgeInfo = newVal;
    sessionStorage.setItem('imgData', JSON.stringify(imgDataObj));
  }
}, { deep: true })

onMounted(async () => {
  // 回填 User Setting Save 時的 Search Lot ID
  searchLotId.value = sessionStorage.getItem('searchLotId') ?? ''
  isShowSearchLotId.value = searchLotId.value ? true : false
  sessionStorage.removeItem('searchLotId')

  // 取得 Condition、Retype 等...，通用設定
  settings.value = (await LabelViewIO.getSettings()).data
  // 取得最後一次 Label 的資訊，用於取得 vorInputId
  imgData.value = (
    await LabelViewIO.findLastImageInfo(userInfoStore.userId.value, settings.value?.queryHours)
  ).data
  if (settings.value?.queryHours !== undefined) {
    queryHours.value = settings.value.queryHours;
  }
  const storedSetting = sessionStorage.getItem("isShowSetting");
  if (storedSetting !== null && storedSetting !== undefined) {
    isShowSetting.value = JSON.parse(storedSetting);
  }
  await getImageInfo('next','init')
  // 註冊快捷鍵全域事件
  window.addEventListener('keyup', hotKey)
  isInitialized.value = true
})

onBeforeUnmount(() => {
  // 離開畫面時，解除註冊快捷鍵全域事件
  window.removeEventListener('keyup', hotKey)
})

// 快捷鍵對應
function hotKey(e: KeyboardEvent) {
  switch (e.key) {
    // 按下R進入維修標記模式
    case 'r':
      opModeSwitch('repair')
      break

    // 按下T進入訓練標記模式
    case 't':
      opModeSwitch('training')
      break

    // 按下左方向鍵，取得上一張圖
    case 'ArrowLeft':
      getImageInfo('previous','transfer')
      break

    // 按下右方向鍵，取得下一張圖
    case 'ArrowRight':
      getImageInfo('next','transfer')
      break

    // 按下ESC鍵，回上一步
    case 'Escape':
      historyUndo()
      break
    // 取消repair模式
    case '`':
      resetPen()
      break
  }

  // 確認有先按住Alt鍵
  if (e.altKey) {
    var codeTemp = parseInt(e.key)

    // 如果是數字 0~9 就是 Combine Key 操作，要帶入預設的選項組合
    if (codeTemp >= 0 && codeTemp <= 9) {
      // 取得對應 Key 的選項組合
      var combineKey = JSON.parse(
        JSON.stringify(settings.value?.combineKeyList.find((ele) => ele.key === e.key))
      )

      // 設定判 Code 選項
      if (combineKey?.lcvList) {
        operationInfo.value.addLcvDftMode = combineKey?.lcvList
      }

      if (combineKey?.lsrJudgeColletion) {
        operationInfo.value.lsrJudgeColletion = combineKey?.lsrJudgeColletion
      }

      if (combineKey?.lsrJudge) {
        operationInfo.value.lsrJudge = combineKey?.lsrJudge
      }

      if (combineKey?.retypeCatgory) {
        operationInfo.value.retypeCatgory = combineKey?.retypeCatgory
      }

      if (combineKey?.retype) {
        operationInfo.value.retype = combineKey?.retype
      }

      if (combineKey?.rpFlag) {
        operationInfo.value.rpFlag = combineKey?.rpFlag
      }

      // 設定 Repair Condition 選項
      let comboTemp = combineKey?.conditionList?.find(
        (ele: any) => ele.comboName == combo.value?.comboName
      )

      if (comboTemp) {
        switchPen(comboTemp.penType)
        setCondition(comboTemp.condition)
      }
    }
  }
}

// 儲存Label結果
async function save() {
  let errorMsg = ''
  let succeedMsg = 'Save succeed'
  if (!operationInfo.value.lsrJudge) {
    errorMsg = 'LSR Judge is necessary'
  } else if (!operationInfo.value.rpFlag) {
    errorMsg = 'RP Flag is necessary'
  } else if (!operationInfo.value.retype) {
    errorMsg = 'Retype is necessary'
  }
  // 如果沒訓練標記就彈出警告
  else if (operationInfo.value.rpFlag != 'N' && !trainingLabel.value) {
    errorMsg = 'Training Lable is necessary'
  }

  if (errorMsg) {
    ElMessage({
      showClose: true,
      message: errorMsg,
      type: 'error'
    })
    return errorMsg
  }

  let exportInfo = exportInfoData()

  await LabelViewIO.saveLabelInfo(exportInfo)
  isMotifyAndNotSave.value = false

  ElMessage({
    showClose: true,
    message: succeedMsg,
    type: 'success'
  })
  return succeedMsg
}

// 儲存Label結果到SessionStorage
function saveLabelToSessionStorage() {
  let exportInfo = exportInfoData();
  const storedData = sessionStorage.getItem('imgData');
  
  if (storedData !== null) {
    const imgDataObj = JSON.parse(storedData);
    imgDataObj.labelInfo = exportInfo.labelInfo;
    imgDataObj.imgInfo = exportInfo.imgInfo;
    sessionStorage.setItem('imgData', JSON.stringify(imgDataObj));
  }
}

// 匯出資料
function exportInfoData() {
  // 因為畫矩形時，有可能從先點右下再點左上，所以要修正將最小的值排在第一組
  let fixRectPosition = (arr: number[]): number[] => {
    return [
      Math.min(arr[0], arr[2]),
      Math.min(arr[1], arr[3]),
      Math.max(arr[0], arr[2]),
      Math.max(arr[1], arr[3])
    ]
  }

  // 匯出point、line、block Label資訊
  let tempExport = ml.value?.exportLabels()
  let labelList = tempExport
    .filter((ele: any) => ele.type !== 'training')
    .map((ele: any) => {
      if(ele.type == 'point'){
        return Object.assign(
          {
            repairType: 'point',
            type: 'RPR',
            moveMethod: 'rpixel',
            repairRoute: ele.points,
            color: ele.color
          },
          ele.ext
        )
      }
      if(ele.type == 'line'){
        return Object.assign(
          {
            repairType: 'line',
            type: 'RLR',
            moveMethod: 'rpixel',
            repairRoute: ele.points,
            color: ele.color
          },
          ele.ext
        )
      }
      if(ele.type == 'block'){
        return Object.assign(
          {
            repairType: 'block',
            type: 'RLR',
            moveMethod: 'rpixel',
            repairRoute:  fixRectPosition(ele.points),
            color: ele.color
          },
          ele.ext
        )
      }
    })

  let trainingPoints = tempExport.find((ele: any) => ele.type == 'training')?.points
  if (trainingPoints !== undefined) {
    trainingPoints = fixRectPosition(trainingPoints)
  } 

  // 組合WebAPI呼叫內容
  let exportInfo: LabelType.LabelInfoRequest = {
    userId: userInfoStore.userId.value,
    time: settings.value?.queryHours ?? 0,
    judgeInfo: {
      addLcv: operationInfo.value.addLcvDftMode.length > 0,
      addLcvDftMode: operationInfo.value.addLcvDftMode,
      retype: operationInfo.value.retype,
      lsrJudge: operationInfo.value.lsrJudge,
      rpFlag: operationInfo.value.rpFlag,
      lsrJudgeColletion: operationInfo.value.lsrJudgeColletion,
      retypeCatgory: operationInfo.value.retypeCatgory
    },
    imgInfo: {
      ...((imgData.value?.imgInfo) as LabelType.ImgInfo || {}),
      xMin: trainingPoints ? trainingPoints[0] : null,
      yMin: trainingPoints ? trainingPoints[1] : null,
      xMax: trainingPoints ? trainingPoints[2] : null,
      yMax: trainingPoints ? trainingPoints[3] : null,
    },
    labelInfo: {
      labelList: labelList,
      imgSize: {
        imgW: ml.value?.imgData.width ?? 0,
        imgH: ml.value?.imgData.height ?? 0
      }
    }
  }
  return exportInfo ; 
}

function labelToNewScope(labelInfo:LabelInfo[]) {
  // 因為畫矩形時，有可能從先點右下再點左上，所以要修正將最小的值排在第一組
  let fixRectPosition = (arr: number[]): number[] => {
    return [
      Math.min(arr[0], arr[2]),
      Math.min(arr[1], arr[3]),
      Math.max(arr[0], arr[2]),
      Math.max(arr[1], arr[3])
    ]
  }

  // 匯出point、line、block Label資訊
  let tempExport = ml.value?.newExportLabels(labelInfo)
  let data = tempExport
    .map((ele: any) => {
      if(ele.type === 'point'){
        return Object.assign(
          {
            repairType: 'point',
            repairRoute: ele.points,
            condition: ele.ext.condition
          }
        )
      }
      else if(ele.type === 'line'){
        return Object.assign(
          {
            repairType: 'line',
            repairRoute: ele.points,
            condition: ele.ext.condition
          }
        )
      }
      if(ele.type === 'block'){
        return Object.assign(
          {
            repairType: 'block',
            repairRoute: fixRectPosition(ele.points),
            condition: ele.ext.condition
          }
        )
      }
    })
    return data
}

// 取得下一張或上一張圖片與相關資訊
async function getImageInfo(direction: string,state: string) {
  // 資料變更提示
  if (state !== 'init') {
    let msg = await save()
    if(msg !== 'Save succeed'){
      return;
    }
  }

  if (state == 'transfer') {
    await setTransferImgData(direction)
  }
  else if(state == 'init'){
    await setInitImgData()
  }
  else if(state == 'search'){
    await setSearchImgData()
  }

  opMode.value = ''
  penType.value = ''
  imgInfo.value = null
  selectCondition.value = ''
  operationInfo.value.addLcvDftMode = []
  operationInfo.value.lsrJudge = ''
  operationInfo.value.retypeCatgory = ''
  operationInfo.value.retype = ''
  operationInfo.value.rpFlag = ''
  ml.value?.resetStage()

  if (!imgData.value || !imgData.value.imgInfo || !imgData.value.imgInfo.vorInputId) return

  let imgPath = imgData.value.imgPath ?? ''
  imgInfo.value = imgData.value.imgInfo
  operationInfo.value.addLcvDftMode = imgData.value.judgeInfo?.addLcvDftMode ?? []
  operationInfo.value.lsrJudgeColletion = imgData.value.judgeInfo?.lsrJudgeColletion ?? ''
  operationInfo.value.lsrJudge = imgData.value.judgeInfo?.lsrJudge ?? ''
  operationInfo.value.retypeCatgory = imgData.value.judgeInfo?.retypeCatgory ?? ''
  operationInfo.value.retype = imgData.value.judgeInfo?.retype ?? ''
  operationInfo.value.rpFlag = imgData.value.judgeInfo?.rpFlag ?? ''

  // 使 LSR Judge UI選單正確變換對應
  settings.value?.lsrJudge.find((ele: { subs: any[]; value: string }) => {
    if (
      ele.subs.find((ele2: { value: any }) => {
        return ele2.value == operationInfo.value.lsrJudge
      })
    ) {
      operationInfo.value.lsrJudgeColletion = ele.value
      return ele
    }
  })

  // 如果沒有 LSR Judge 值，就先預設為 POINT 選項
  if (!operationInfo.value.lsrJudgeColletion) {
    operationInfo.value.lsrJudgeColletion = 'point'
  }

  // 使 Retype UI選單正確變換對應
  settings.value?.retype.find((ele: { subs: any[]; value: string }) => {
    if (
      ele.subs.find((ele2: { value: any }) => {
        return ele2.value == operationInfo.value.retype
      })
    ) {
      operationInfo.value.retypeCatgory = ele.value
      return ele
    }
  })

  // 載入圖片
  await ml.value?.loadImage(
    `${import.meta.env.VITE_API_PREFIX_PATH || ''}${imgPath}${
      imgData.value.imgInfo.imgName
    }?station=${imgData.value.imgInfo.station}&lotId=${imgData.value.imgInfo.lotId}&t=${Date.now()}`
  )

  // 尋找對應 Product 的 ConditionCombo，設定為待用的 Repair Pen
  combo.value = settings.value?.conditionCombo.find((ele) => {
    return ele.products.find((ele2: { value: string | undefined }) => {
      return ele2.value == imgInfo.value?.prodName
    })
  })
  // 尋找對應 Product 的 Macro，並區分出空Macro
  filterMacrosWithLabelValue()
  // 如果沒有對應 Product 的 Condition Combo 就跳出警告
  if (!combo.value) {
    ElMessage({
      showClose: true,
      message: 'There is no corresponding product ',
      type: 'error'
    })
  }

  // 如果有Label資訊，就匯入
  if (readyForLabeling.value) {
    penType.value = ''

    if (typeof imgData.value.imgInfo.xMin === 'number') {
      ml.value?.importLabel(
        'training',
        [
          imgData.value.imgInfo.xMin,
          imgData.value.imgInfo.yMin,
          imgData.value.imgInfo.xMax,
          imgData.value.imgInfo.yMax
        ],
        '#00FF00',
        5,
        undefined,
        settings.value?.ConditionOpacity,
      )
    }

    imgData.value?.labelInfo?.labelList?.forEach((ele) => {
      if(ele.repairType == "point") {
        ml.value?.importLabel(
          'point',
          ele.repairRoute,
          ele.color,
          ele.sliter / (imgInfo.value?.imgResolutionX ?? 0),
          {
            condition: ele.condition,
            moveMethod: ele.moveMethod,
            runSteps: ele.runSteps,
            sliter: ele.sliter,
            order: ele.order,
            lens: ele.lens
          },
          settings.value?.ConditionOpacity
        )
      }
      else if(ele.repairType == "line") {
        ml.value?.importLabel(
          'line',
          ele.repairRoute,
          ele.color,
          ele.sliter / (imgInfo.value?.imgResolutionX ?? 0),
          {
            condition: ele.condition,
            moveMethod: ele.moveMethod,
            runSteps: ele.runSteps,
            sliter: ele.sliter,
            order: ele.order,
            lens: ele.lens
          },
          settings.value?.ConditionOpacity
        )
      }
      else if(ele.repairType == "block") {
        ml.value?.importLabel(
          'block', 
          ele.repairRoute, 
          ele.color,
          ele.sliter, 
          {
            condition: ele.condition,
            moveMethod: ele.moveMethod,
            runSteps: ele.runSteps,
            sliter: ele.sliter,
            order: ele.order,
            lens: ele.lens
          },
          settings.value?.ConditionOpacity
        )
      }
    })
  }

  historyCommit()

  // 留下最後的Commit作為起始值
  operationInfoHistory.clear()
  ml?.value?.getLabelInfoHistory().clear()

  // 取得Next時要自動進入Repair Mode
  if (direction == 'next') {
    opModeSwitch('repair')
  }

  isMotifyAndNotSave.value = false
}

// 執行Macro功能
function createMacroLabel( name: string,) {
  let selectMacro = macros?.value?.find((macro) =>macro.name === name)
  let checkConditionExist = true
  selectMacro?.value?.forEach((ele) => {
    let matchingCondition = null
    switch(ele.repairType) {
      case 'point':
        matchingCondition = combo?.value?.pointConditions.find((con) => {
          return ele.condition == con.condition;
        });
        break;
      case 'line':
        matchingCondition = combo?.value?.lineConditions.find((con) => {
          return ele.condition == con.condition;
        });
        break;
      case 'block':
        matchingCondition = combo?.value?.blockConditions.find((con) => {
          return ele.condition == con.condition;
        });
        break;
    }
    if (matchingCondition) {
      ele.moveMethod = matchingCondition.moveMethod
      ele.runSteps = matchingCondition.runSteps
      ele.sliter = matchingCondition.sliter
      ele.order = matchingCondition.order
      ele.lens = matchingCondition.lens
      ele.color = matchingCondition.color
    }
    else{
      ElMessage({
        showClose: true,
        message: 'Condition: ' + ele.condition + ' does not exist in ' + ele.repairType,
        type: 'warning'
      })
      checkConditionExist = false
    }
  })
  if(checkConditionExist){
    ml.value?.setMacroData( selectMacro?.value, imgInfo.value?.imgResolutionX, settings.value?.ConditionOpacity)
  }
}

async function setInitImgData(){
  let imgDataTemp = null;
  let storedImgData = sessionStorage.getItem('imgData')
  if(storedImgData){
    const retrievedImgData = JSON.parse(storedImgData);
    imgDataTemp = retrievedImgData
  }
  else{
    imgDataTemp = (
      await LabelViewIO.getNextImageInfo(
        userInfoStore.userId.value,
        imgData.value?.imgInfo?.vorInputId,
        settings.value?.queryHours,
        searchLotId.value,
        isAuto.value
      )
    ).data
    sessionStorage.setItem('imgData', JSON.stringify(imgDataTemp));
  }
  // 如果msg是unLable，就顯示訊息，且別刷掉目前未存檔的Label資訊
  if (imgDataTemp.msg == 'unLable') {
    ElMessage({
      showClose: true,
      message: '此 img 尚未 Label 完成 (需按 Save)',
      type: 'warning'
    })

    if (imgInfo.value) return
  }

  imgData.value = imgDataTemp
}

async function setTransferImgData(direction: string){
  if (direction == 'previous') {
    let imgDataTemp = (
      await LabelViewIO.getPreviousImageInfo(
        userInfoStore.userId.value,
        imgData.value?.imgInfo?.vorInputId,
        settings.value?.queryHours,
        searchLotId.value,
        isAuto.value
      )
    ).data
    if(imgDataTemp!==null){
      sessionStorage.setItem('imgData', JSON.stringify(imgDataTemp));
    }
    imgData.value = imgDataTemp
    // 如果msg是first，就顯示訊息
    if (imgData.value.msg == 'first') {
      ElMessage({
        showClose: true,
        message: '此 img 已經是第一張',
        type: 'warning'
      })
    }
  } else {
    let imgDataTemp = (
      await LabelViewIO.getNextImageInfo(
        userInfoStore.userId.value,
        imgData.value?.imgInfo?.vorInputId,
        settings.value?.queryHours,
        searchLotId.value,
        isAuto.value
      )
    ).data
    if(imgDataTemp!==null){
      sessionStorage.setItem('imgData', JSON.stringify(imgDataTemp));
    }
    // 如果msg是unLable，就顯示訊息，且別刷掉目前未存檔的Label資訊
    if (imgDataTemp.msg == 'unLable') {
      ElMessage({
        showClose: true,
        message: '此 img 尚未 Label 完成 (需按 Save)',
        type: 'warning'
      })

      if (imgInfo.value) return
    }

    imgData.value = imgDataTemp
  }

}

async function setSearchImgData(){
  let imgDataTemp = (
    await LabelViewIO.getPreviousImageInfo(
      userInfoStore.userId.value,
      imgData.value?.imgInfo?.vorInputId,
      settings.value?.queryHours,
      searchLotId.value,
      isAuto.value
    )
  ).data
  imgDataTemp = (
    await LabelViewIO.getNextImageInfo(
      userInfoStore.userId.value,
      imgDataTemp?.imgInfo?.vorInputId,
      settings.value?.queryHours,
      searchLotId.value,
      isAuto.value
    )
  ).data
  if(imgDataTemp!==null){
    sessionStorage.setItem('imgData', JSON.stringify(imgDataTemp));
  }
  // 如果msg是unLable，就顯示訊息，且別刷掉目前未存檔的Label資訊
  if (imgDataTemp.msg == 'unLable') {
    ElMessage({
      showClose: true,
      message: '此 img 尚未 Label 完成 (需按 Save)',
      type: 'warning'
    })

    if (imgInfo.value) return
  }

  imgData.value = imgDataTemp
}

// 增加 Undo、Redo 記錄點
function historyCommit() {
  motifyData()
  // operationInfoHistory.commit()
  ml?.value?.getLabelInfoHistory().commit()
  saveLabelToSessionStorage()
}

// Undo 記錄點
function historyUndo() {
  //ml.value?.resetPen()
  // operationInfoHistory.undo()
  ml?.value?.getLabelInfoHistory().undo()
  saveLabelToSessionStorage()
}

// Redo 記錄點
function historyRedo() {
  ml.value?.resetPen()
  // operationInfoHistory.redo()
  ml?.value?.getLabelInfoHistory().redo()
  saveLabelToSessionStorage()
}

function resetPen() {
  ml.value?.resetPen()
  // operationInfoHistory.redo()
}

// 刪除 Label
function deleteLabel(label: LabelInfo) {
  let i = repairLabelList.value?.findIndex((item: LabelInfo) => label == item)

  if (i !== undefined) {
    repairLabelList.value?.splice(i, 1)
    label.instance.destroy()
  }

  historyCommit()
}

// 拖曳 Label
function labelMoved() {
  historyCommit()
}

// 新增 Macro
function macroAdded() {
  historyCommit()
}

// 綁定 Macro
async function macroBind(name: string, macroLabelInfoList: LabelInfo[] ) {
  let hasTrainingLabel = macroLabelInfoList.some((labelInfo) => labelInfo.type == 'training')
  if (hasTrainingLabel){
    ElMessage({
      showClose: true,
      message: '不可以綁定alignment',
      type: 'error'
    })
  }
  else {
    let macroData= labelToNewScope(macroLabelInfoList)
    settings.value?.macros.forEach((macro) => {
      if (macro.name === name) { 
        macro.value = macroData;
      }
    })
    await LabelViewIO.saveSettings(settings.value, userInfoStore.userId.value)
    ElMessage({
      showClose: true,
      message: 'Save succeed',
      type: 'success'
    })
    filterMacrosWithLabelValue() 
    userSettingsSaved()
  }
}

function filterMacrosWithLabelValue() {
  macros.value = settings.value?.macros.filter((macro) => {
    return macro.products.find((product: { value: string | undefined }) => product.value === imgInfo.value?.prodName)&&
           macro.value.length > 0;
  })
  let emptyMacros = settings.value?.macros.filter((macro) => {
    return macro.products.find((product: { value: string | undefined }) => product.value === imgInfo.value?.prodName)&&
           macro.value.length === 0;
  })
  ml.value?.setEmptyMacros(emptyMacros)
}

// 刪除全部 Label
function deleteAllLabel() {
  ElMessageBox.confirm('確定要刪除全部Label嗎?', '', {
    confirmButtonText: '是',
    cancelButtonText: '否',
    type: 'warning'
  }).then(() => {
    repairLabelList.value?.forEach((ele: any) => {
      ele.instance.destroy()
    })

    repairLabelList.value?.splice(0, repairLabelList.value.length)
    historyCommit()
  })
}

// 凸顯 Label
function heightLight(label: LabelInfo) {
  ml.value?.heightLight(label)
}

// 如果按下Enter新增Label
function labelAdded(label: LabelInfo) {
  if (label.type == 'training' && trainingLabel.value) {
    ml.value?.resetPen()
    penType.value = ''
    opMode.value = ''
  }

  historyCommit()
}

// 右鍵選單刪除Label事件
function labelRemoved() {
  historyCommit()
}

// 開關顯示Label
function labelListVisibleSwitch(label?: LabelInfo) {
  if (label) {
    label.instance.visible(!label.instance.visible())
  } else {
    let v = false

    repairLabelList.value?.forEach((ele: any, i: number) => {
      if (i === 0) {
        v = !ele.instance.visible()
      }

      ele.instance.visible(v)
    })
  }
}

// 切換 Repair、Training Label 模式
function opModeSwitch(mode: string) {
  opMode.value = mode
  switchPen('')

  if (mode == 'training') {
    penType.value = 'training'
    setLabelPen()
  }
}

// 循環切換Repair Pen(Point、Line、Block)
function switchPen(type: string) {
  selectCondition.value = ''
  penType.value = type

  conditions.value = penType.value
    ? Reflect.get(combo.value ?? {}, penType.value + 'Conditions')
    : []
  setLabelPen()
}

// 設定繪製Label Pen
function setLabelPen() {
  ml.value?.resetPen()

  if (penType.value == 'training') {
    if (trainingLabel.value) {
      penType.value = ''
      opMode.value = ''
    } else {
      ml.value?.setPen(penType.value, 5, { condition: '', sliter: 5 }, '#808080')
      ml.value?.setPenStableColor('green');
    }
  } else {
    let conditionData = conditions.value.find((ele) => ele.condition == selectCondition.value)

    if (!conditionData || !imgInfo.value?.imgResolutionX) return

    let penSize = conditionData.sliter / imgInfo.value?.imgResolutionX

    ml.value?.setPen(penType.value, penSize, {
      condition: selectCondition.value,
      sliter: conditionData.sliter,
      moveMethod: conditionData.moveMethod,
      runSteps: conditionData.runSteps,
      order: conditionData.order,
      lens: conditionData.lens
    }, '#808080', settings.value?.ConditionOpacity)

    ml.value?.setPenStableColor(conditionData.color);
  }
}

// 設定Condition
function setCondition(condition: string) {
  selectPointCondition.value = ''
  selectLineCondition.value = ''
  selectBlockCondition.value = ''
  selectCondition.value = condition
  setLabelPen()
}

// 切換 LSR Judge 選單
function switchLsrJudge() {
  let lsrJudgeColletionIndex = lsrJudgeColletionList.value.indexOf(
    operationInfo.value.lsrJudgeColletion
  )

  if (
    lsrJudgeColletionIndex < 0 ||
    lsrJudgeColletionIndex == lsrJudgeColletionList.value.length - 1
  ) {
    operationInfo.value.lsrJudgeColletion = lsrJudgeColletionList.value[0]
  } else {
    operationInfo.value.lsrJudgeColletion = lsrJudgeColletionList.value[lsrJudgeColletionIndex + 1]
  }
}

function rpFlagChanged() {
  // 當 RP Flag 為 Nothing(N) 時，要同時設定 LSR Judge 為 N，Retype 為 HotKey 的 I-Nothing
  if (operationInfo.value.rpFlag == 'N') {
    operationInfo.value.lsrJudgeColletion = 'point'
    operationInfo.value.lsrJudge = 'N'
    operationInfo.value.retypeCatgory = 'HotKey'
    operationInfo.value.retype = 'I-Nothing'
  }
}

// 使用者儲存設定後，重新載入設定
function userSettingsSaved() {
  // 重新載入設定前要先記住目前 Search Lot ID，載入完後要再回填
  sessionStorage.setItem('searchLotId', searchLotId.value)
  isShowSetting.value = false
  location.reload()
}

// 使用者儲存設定後，重新載入設定
async function userSettingsClosed() {
  // 重新載入設定前要先記住目前 Search Lot ID，載入完後要再回填
  sessionStorage.setItem('searchLotId', searchLotId.value)
  await ElMessageBox.confirm('確定要放棄變更嗎?', 'Warning', {
      confirmButtonText: '是',
      cancelButtonText: '否',
      type: 'warning'
    })
      .then(() => {
        isShowSetting.value = false
        sessionStorage.removeItem('settings')
      })
      .catch(() => {
        return
      })
}

function PermissionProfileSaved() {
  isShowPermissionProfileSetting.value = false
}

function PermissionProfileClosed() {
  isShowPermissionProfileSetting.value = false
}

function WipListClosed() {
  isShowWipList.value = false
}

async function searchImgData(lotId: string) {
  operationInfoHistory.clear()
  isShowWipList.value = false
  searchLotId.value = lotId
  await getImageInfo('next','search');
  
}

// 判斷 SheetInfo List 的 Row 是否與現在 Labeling 的 SheetInfo 一致
function isCurrentSheetInfo(rowSheetInfo: LabelType.ImgInfo) {
  return (
    imgInfo.value?.lotId === rowSheetInfo.lotId &&
    imgInfo.value?.chipId === rowSheetInfo.chipId &&
    imgInfo.value?.dataAx === rowSheetInfo.dataAx &&
    imgInfo.value?.gateAx === rowSheetInfo.gateAx &&
    imgInfo.value?.dftMode === rowSheetInfo.dftMode &&
    imgInfo.value?.toolId === rowSheetInfo.toolId &&
    imgInfo.value?.tester === rowSheetInfo.tester &&
    imgInfo.value?.rgb === rowSheetInfo.rgb &&
    imgInfo.value?.ratio === rowSheetInfo.ratio
  )
}

// 判斷是否變更
function motifyData() {
  // if (imgInfo.value?.imgStatus == 2) {
  isMotifyAndNotSave.value = true
  // }
}

// [Only for the Demo Mode]
function showTempImgSelector() {
  let tempImgFileEle = document.querySelector('#tempImgFile') as HTMLInputElement
  console.log(tempImgFileEle)
  tempImgFileEle.onchange = function () {
    console.log(tempImgFileEle.files)
    if (tempImgFileEle.files) {
      let blobUrl = window.URL.createObjectURL(tempImgFileEle.files[0])

      ml.value?.loadImage(blobUrl)
    }
  }

  tempImgFileEle.click()
}

</script>

<style scoped>
/* .el-table .cell {
   padding: 0 !important;
} */
.infinite-list {
  height: 500px;
  padding: 0;
  margin: 0;
  list-style: none;
}

.el-row {
  margin-bottom: 10px;
}

.el-row:last-child {
  margin-bottom: 0;
}

.el-col {
  border-radius: 4px;
}
::v-deep #sheet_info_table   .cell {
  padding: 0 2px;
  text-align: center; 
  overflow: hidden; 
  white-space: nowrap; 
  text-overflow: ellipsis;
}
::v-deep #sheet_info_table  .el-table__cell{
  padding: 0 2px;
}

.grid-content {
  border-radius: 4px;
  min-height: 36px;
}

/* .vor-border .text {
  width: 15%;
}
.vor-border .line {
  width: 70%;
} */
.vor-border-line {
  /* width: 100%; */
  /* height: 0; */
  border: 1px solid var(--el-border-color);
  border-radius: 5px;
  /* margin: 5px; */

  margin: 5px;
  padding: 5px;
}

.vor-btn {
  width: 100%;
  /* margin: 5px; */
}

/* .vor-border .line .dashed {
  border-top: 2px dashed var(--el-border-color);
} */
</style>

<style>
#ele_id_isAuto .el-radio-button__inner {
  height: 40px;
}
</style>
@/components/MultiLabel.mjs
