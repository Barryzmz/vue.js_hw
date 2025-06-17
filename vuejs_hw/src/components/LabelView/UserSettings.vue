<template>
  <el-dialog v-model="_isShow" title="Settings" :show-close="false" :before-close="() => {}" style="margin-top: 10px; margin-bottom: 10px; width: 60%;">
    <el-tabs type="border-card"  v-model="activeTab">
      <!-- Retype -->
      <el-tab-pane label="Retype">
        <el-card class="box-card">
          <el-table
            :highlight-current-row="true"
            :data="settings?.retype"
            style="width: 100%"
            max-height="250"
          >
            <el-table-column label="Name" width="600px">
              <template #default="scope">
                <el-input v-model="scope.row.value" placeholder="Please input" :disabled="!(settingPermissionList?.retype)"/>
              </template>
            </el-table-column>
            <el-table-column label="Operations">
              <template #default="scope">
                <el-button
                  link
                  type="primary"
                  size="small"
                  @click.prevent="retypeIndex = scope.$index"
                >
                  Select
                </el-button>

                <el-button
                  link
                  type="primary"
                  size="small"
                  @click.prevent="removeRetype(scope.$index)"
                  :disabled= "!(settingPermissionList?.retype)"
                >
                  Remove
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-button
            class="mt-4"
            style="width: 100%"
            @click="
              () => {
                settings?.retype.push({ value: '', subs: [{ value: '' }] })
              }
            "
            :disabled="!(settingPermissionList?.retype)"
            >Add Item</el-button
          >
        </el-card>

        <div style="height: 20px"></div>

        <el-card v-if="retypeIndex >= 0" class="box-card">
          <el-table
            :data="retypeIndex >= 0 ? settings?.retype[retypeIndex].subs : []"
            style="width: 100%"
            max-height="250"
          >
            <el-table-column label="Name" width="600px">
              <template #default="scope">
                <el-input v-model="scope.row.value" placeholder="Please input" :disabled="!(settingPermissionList?.retype)"/>
              </template>
            </el-table-column>
            <el-table-column label="Operations" width="120">
              <template #default="scope">
                <el-button
                  link
                  type="primary"
                  size="small"
                  @click.prevent="removeRetypeSubs(scope.$index)"
                  :disabled= "!(settingPermissionList?.retype)"
                >
                  Remove
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-button
            class="mt-4"
            style="width: 100%"
            @click="
              () => {
                settings?.retype[retypeIndex].subs.push({ value: '' })
              }
            "
            :disabled="!(settingPermissionList?.retype)"
            >Add Item</el-button
          >
        </el-card>
      </el-tab-pane>

      <!-- LCV -->
      <el-tab-pane label="LCV">
        <el-table :data="settings?.lcv" style="width: 100%" max-height="500">
          <el-table-column label="Name" width="300px">
            <template #default="scope">
              <el-input v-model="scope.row.value" placeholder="Please input" :disabled="!(settingPermissionList?.lcv)"/>
            </template>
          </el-table-column>
          <el-table-column label="Operations">
            <template #default="scope">
              <el-button link type="primary" size="small" @click.prevent="removeLcv(scope.$index)" :disabled= "!(settingPermissionList?.lcv)">
                Remove
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-button class="mt-4" style="width: 100%" @click="settings?.lcv.push({ value: '' }) " :disabled="!(settingPermissionList?.lcv)"
          >Add Item</el-button
        >
      </el-tab-pane>

      <!-- LSR Judge -->
      <el-tab-pane label="LSR Judge">
        <el-card class="box-card">
          <el-table
            :highlight-current-row="true"
            :data="settings?.lsrJudge"
            style="width: 100%"
            max-height="250"
          >
            <el-table-column label="Name" width="600px">
              <template #default="scope">
                {{scope.row.value}}
              </template>
            </el-table-column>
            <el-table-column label="Operations">
              <template #default="scope">
                <el-button
                  link
                  type="primary"
                  size="small"
                  @click.prevent="lsrJudgeIndex = scope.$index"
                >
                  Select
                </el-button>

              </template>
            </el-table-column>
          </el-table>
        </el-card>

        <div style="height: 20px"></div>

        <el-card v-if="lsrJudgeIndex >= 0" class="box-card">
          <el-table
            :data="lsrJudgeIndex >= 0 ? settings?.lsrJudge[lsrJudgeIndex].subs : []"
            style="width: 100%"
            max-height="250"
          >
            <el-table-column label="HotKey" >
              <template #default="scope">
                <el-checkbox
                  v-model="scope.row.isHotKey"
                  :disabled="!(settingPermissionList?.lsrJudge) ||
                    calcHotKeyDisabled(
                      settings?.lsrJudge[lsrJudgeIndex].subs,
                      scope.row,
                      9
                    )
                  "
                />
              </template>
            </el-table-column>
            <el-table-column label="Name" width="600px">
              <template #default="scope">
                <el-input v-model="scope.row.value" placeholder="Please input" :disabled="!(settingPermissionList?.lsrJudge)"/>
              </template>
            </el-table-column>
            <el-table-column label="Operations" width="120">
              <template #default="scope">
                <el-button
                  link
                  type="primary"
                  size="small"
                  @click.prevent="removeLsrJudgeSubs(scope.$index)"
                  :disabled= "!(settingPermissionList?.lsrJudge)"
                >
                  Remove
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-button
            class="mt-4"
            style="width: 100%"
            @click="
              () => {
                settings?.lsrJudge[lsrJudgeIndex].subs.push({ value: '', isHotKey: false})
              }
            "
            :disabled="!(settingPermissionList?.lsrJudge)"
            >Add Item</el-button
          >
        </el-card>
      </el-tab-pane>

      <!-- Combo -->
      <el-tab-pane label="Condition">
        <el-card class="box-card">
          <el-table
            :highlight-current-row="true"
            :data="settings?.conditionCombo"
            style="width: 100%"
            max-height="250"
          >
            <el-table-column label="Combo Name" width="600px">
              <template #default="scope">
                <el-input v-model="scope.row.comboName" placeholder="Please input" :disabled="!(settingPermissionList?.conditionCombo)"/>
              </template>
            </el-table-column>
            <el-table-column label="Operations">
              <template #default="scope">
                <el-button
                  link
                  type="primary"
                  size="small"
                  @click.prevent="conditionComboIndex = scope.$index"
                >
                  Select
                </el-button>

                <el-button
                  link
                  type="primary"
                  size="small"
                  @click.prevent="removeCombo(scope.$index)"
                  :disabled= "!(settingPermissionList?.conditionCombo)"
                >
                  Remove
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-button class="mt-4" style="width: 100%" @click="addCombo(settings?.conditionCombo )" :disabled="!(settingPermissionList?.conditionCombo)"
            >Add Item</el-button
          >
        </el-card>

        <div style="height: 20px"></div>

        <el-tabs v-if="conditionComboIndex >= 0" type="border-card">
          <!-- Combo Dot -->
          <el-tab-pane label="Point">
            <el-card class="box-card">
              <el-table
                :data="settings?.conditionCombo[conditionComboIndex].pointConditions"
                style="width: 100%"
                max-height="250"
              >
                <el-table-column label="HotKey" min-width="100">
                  <template #default="scope">
                    <el-checkbox
                      v-model="scope.row.isHotKey"
                      :disabled="!(settingPermissionList?.conditionCombo) ||
                        calcHotKeyDisabled(
                          settings?.conditionCombo[conditionComboIndex].pointConditions,
                          scope.row,
                          4
                        )
                      "
                    />
                  </template>
                </el-table-column>
                <el-table-column label="Condition" min-width="100">
                  <template #default="scope">
                    <el-input v-model="scope.row.condition" placeholder="Please input" :disabled="!(settingPermissionList?.conditionCombo)"/>
                  </template>
                </el-table-column>
                <el-table-column label="Move Method" min-width="120">
                  <template #default="scope">
                    <el-input v-model="scope.row.moveMethod" placeholder="Please input" :disabled="!(settingPermissionList?.conditionCombo)"/>
                  </template>
                </el-table-column>
                <el-table-column label="Run Steps" min-width="100">
                  <template #default="scope">
                    <el-input v-model="scope.row.runSteps" placeholder="Please input" :disabled="!(settingPermissionList?.conditionCombo)"/>
                  </template>
                </el-table-column>
                <el-table-column label="Sliter" min-width="100">
                  <template #default="scope">
                    <el-input v-model="scope.row.sliter" placeholder="Please input" :disabled="!(settingPermissionList?.conditionCombo)"/>
                  </template>
                </el-table-column>
                <el-table-column label="Order" min-width="100">
                  <template #default="scope">
                    <el-input v-model="scope.row.order" placeholder="Please input" :disabled="!(settingPermissionList?.conditionCombo)"/>
                  </template>
                </el-table-column>
                <el-table-column label="Lens" min-width="100">
                  <template #default="scope">
                    <el-select
                      v-model="scope.row.lens"
                      placeholder="Please input"
                      @change="handleLensColor(
                        settings?.conditionCombo[conditionComboIndex].pointConditions,
                        scope.$index,
                      )"
                      :disabled="!(settingPermissionList?.conditionCombo)"
                    >
                      <el-option
                        v-for="item in settings.lensColorMappingList"
                        :key="item.lens"
                        :label="item.lens"
                        :value="item.lens"
                      />
                    </el-select>
                  </template>
                </el-table-column>

                <el-table-column label="Operations" min-width="100">
                  <template #default="scope">
                    <el-button
                      link
                      type="primary"
                      size="small"
                      @click.prevent="
                        removeCondition(
                          settings?.conditionCombo[conditionComboIndex].pointConditions,
                          scope.$index
                        )
                      "
                      :disabled="!(settingPermissionList?.conditionCombo)"
                    >
                      Remove
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
              <el-button
                class="mt-4"
                style="width: 100%"
                @click="addCondition(settings?.conditionCombo[conditionComboIndex].pointConditions || [])"
                :disabled="!(settingPermissionList?.conditionCombo)"
                >Add Item</el-button
              >
            </el-card>
          </el-tab-pane>

          <!-- Combo Line -->
          <el-tab-pane label="Line">
            <el-card class="box-card">
              <el-table
                :data="settings?.conditionCombo[conditionComboIndex].lineConditions"
                style="width: 100%"
                max-height="250"
              >
                <el-table-column label="HotKey">
                  <template #default="scope">
                    <el-checkbox
                      :disabled="!(settingPermissionList?.conditionCombo) ||
                        calcHotKeyDisabled(
                          settings?.conditionCombo[conditionComboIndex].lineConditions,
                          scope.row,
                          4
                        )
                      "
                      v-model="scope.row.isHotKey"
                    />
                  </template>
                </el-table-column>
                <el-table-column label="condition">
                  <template #default="scope">
                    <el-input v-model="scope.row.condition" placeholder="Please input" :disabled="!(settingPermissionList?.conditionCombo)"/>
                  </template>
                </el-table-column>
                <el-table-column label="moveMethod" min-width="100">
                  <template #default="scope">
                    <el-input v-model="scope.row.moveMethod" placeholder="Please input" :disabled="!(settingPermissionList?.conditionCombo)"/>
                  </template>
                </el-table-column>
                <el-table-column label="runSteps">
                  <template #default="scope">
                    <el-input v-model="scope.row.runSteps" placeholder="Please input" :disabled="!(settingPermissionList?.conditionCombo)"/>
                  </template>
                </el-table-column>
                <el-table-column label="sliter">
                  <template #default="scope">
                    <el-input v-model="scope.row.sliter" placeholder="Please input" :disabled="!(settingPermissionList?.conditionCombo)"/>
                  </template>
                </el-table-column>
                <el-table-column label="order">
                  <template #default="scope">
                    <el-input v-model="scope.row.order" placeholder="Please input" :disabled="!(settingPermissionList?.conditionCombo)"/>
                  </template>
                </el-table-column>
                <el-table-column label="lens">
                  <template #default="scope">
                    <el-select
                      v-model="scope.row.lens"
                      placeholder="Please input"
                      :disabled="!(settingPermissionList?.conditionCombo)"
                    >
                      <el-option
                        v-for="item in settings.lensColorMappingList"
                        :key="item.lens"
                        :label="item.lens"
                        :value="item.lens"
                      />
                    </el-select>
                  </template>
                </el-table-column>

                <el-table-column label="Operations" width="120">
                  <template #default="scope">
                    <el-button
                      link
                      type="primary"
                      size="small"
                      @click.prevent="
                        removeCondition(
                          settings?.conditionCombo[conditionComboIndex].lineConditions,
                          scope.$index
                        )
                      "
                      :disabled="!(settingPermissionList?.conditionCombo)"
                    >
                      Remove
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
              <el-button
                class="mt-4"
                style="width: 100%"
                @click="addCondition(settings?.conditionCombo[conditionComboIndex].lineConditions)"
                :disabled="!(settingPermissionList?.conditionCombo)"
                >Add Item</el-button
              >
            </el-card>
          </el-tab-pane>

          <!-- Combo Block -->
          <el-tab-pane label="Block">
            <el-card class="box-card">
              <el-table
                :data="settings?.conditionCombo[conditionComboIndex].blockConditions"
                style="width: 100%"
                max-height="250"
              >
                <el-table-column label="HotKey">
                  <template #default="scope">
                    <el-checkbox
                      :disabled="!(settingPermissionList?.conditionCombo) ||
                        calcHotKeyDisabled(
                          settings?.conditionCombo[conditionComboIndex].blockConditions,
                          scope.row,
                          4
                        )
                      "
                      v-model="scope.row.isHotKey"
                    />
                  </template>
                </el-table-column>
                <el-table-column label="condition">
                  <template #default="scope">
                    <el-input v-model="scope.row.condition" placeholder="Please input" :disabled="!(settingPermissionList?.conditionCombo)"/>
                  </template>
                </el-table-column>
                <el-table-column label="moveMethod" min-width="100">
                  <template #default="scope">
                    <el-input v-model="scope.row.moveMethod" placeholder="Please input" :disabled="!(settingPermissionList?.conditionCombo)"/>
                  </template>
                </el-table-column>
                <el-table-column label="runSteps">
                  <template #default="scope">
                    <el-input v-model="scope.row.runSteps" placeholder="Please input" :disabled="!(settingPermissionList?.conditionCombo)"/>
                  </template>
                </el-table-column>
                <el-table-column label="sliter">
                  <template #default="scope">
                    <el-input v-model="scope.row.sliter" placeholder="Please input" :disabled="!(settingPermissionList?.conditionCombo)"/>
                  </template>
                </el-table-column>
                <el-table-column label="order">
                  <template #default="scope">
                    <el-input v-model="scope.row.order" placeholder="Please input" :disabled="!(settingPermissionList?.conditionCombo)"/>
                  </template>
                </el-table-column>
                <el-table-column label="lens">
                  <template #default="scope">
                    <el-select
                      v-model="scope.row.lens"
                      placeholder="Please input"
                      :disabled="!(settingPermissionList?.conditionCombo)"
                    >
                      <el-option
                        v-for="item in settings.lensColorMappingList"
                        :key="item.lens"
                        :label="item.lens"
                        :value="item.lens"
                      />
                    </el-select>
                  </template>
                </el-table-column>

                <el-table-column label="Operations" width="120">
                  <template #default="scope">
                    <el-button
                      link
                      type="primary"
                      size="small"
                      @click.prevent="
                        removeCondition(
                          settings?.conditionCombo[conditionComboIndex].blockConditions,
                          scope.$index
                        )
                      "
                      :disabled="!(settingPermissionList?.conditionCombo)"
                    >
                      Remove
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
              <el-button
                class="mt-4"
                style="width: 100%"
                @click="addCondition(settings?.conditionCombo[conditionComboIndex].blockConditions)"
                :disabled="!(settingPermissionList?.conditionCombo)"
                >Add Item</el-button
              >
            </el-card>
          </el-tab-pane>

          <!-- Combo Producut -->
          <el-tab-pane label="Producut">
            <el-card class="box-card">
              <el-table
                :data="settings?.conditionCombo[conditionComboIndex].products"
                style="width: 100%"
                max-height="250"
              >
                <el-table-column label="Producut">
                  <template #default="scope">
                    <el-input v-model="scope.row.value" placeholder="Please input" :disabled="!(settingPermissionList?.conditionCombo)"/>
                  </template>
                </el-table-column>

                <el-table-column label="Operations" width="120">
                  <template #default="scope">
                    <el-button
                      link
                      type="primary"
                      size="small"
                      @click.prevent="removeConditionProduct(scope.$index)"
                      :disabled="!(settingPermissionList?.conditionCombo)"
                    >
                      Remove
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
              <el-button
                class="mt-4"
                style="width: 100%"
                @click="
                  () => {
                    settings?.conditionCombo[conditionComboIndex].products.push({ value: '' })
                  }
                "
                :disabled="!(settingPermissionList?.conditionCombo)"
                >Add Item</el-button
              >
            </el-card>
          </el-tab-pane>
        </el-tabs>
      </el-tab-pane>

      <!-- RP Flag -->
      <el-tab-pane label="RP Flag">
        <el-table :data="settings?.rpFlag" style="width: 100%" max-height="500">
          <el-table-column label="HotKey">
            <template #default="scope">
              <el-checkbox
                v-model="scope.row.isHotKey"
                :disabled="calcHotKeyDisabled(settings?.rpFlag, scope.row,4) || !(settingPermissionList?.rpFlag)"
              />
            </template>
          </el-table-column>
          <el-table-column label="Name" width="300px">
            <template #default="scope">
              <el-input v-model="scope.row.name" placeholder="Please input" :disabled="!(settingPermissionList?.rpFlag)" />
            </template>
          </el-table-column>
          <el-table-column label="Value" width="300px">
            <template #default="scope">
              <el-input v-model="scope.row.value" placeholder="Please input" :disabled="!(settingPermissionList?.rpFlag)"/>
            </template>
          </el-table-column>
          <el-table-column label="Operations">
            <template #default="scope">
              <el-button
                link
                type="primary"
                size="small"
                @click.prevent="removeRpFlag(scope.$index)"
                :disabled="!(settingPermissionList?.rpFlag)"
              >
                Remove
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-button
          class="mt-4"
          style="width: 100%"
          @click="settings?.rpFlag.push({ name: '', value: '', isHotKey: false })"
          :disabled="!(settingPermissionList?.rpFlag)"
          >Add Item</el-button
        >
      </el-tab-pane>

      <!-- Combine Key -->
      <el-tab-pane label="Combine Key">
        <el-tabs>
          <el-tab-pane
            v-for="ele in settings?.combineKeyList"
            :label="'Num ' + ele.key"
            :key="ele.key"
          >
            <!-- 判Code -->
            <el-row>
              <el-col :span="23" class="vor-border-line">
                <!-- Retype -->
                <el-row>
                  <el-col :span="2"> Retype </el-col>
                  <el-col :span="4">
                    <el-select
                      v-model="ele.retypeCatgory"
                      @change="ele.retype = ''"
                      class="m-2"
                      placeholder="Select"
                      size="small"
                      :disabled="!(settingPermissionList?.combineKeyList)"
                    >
                      <el-option
                        v-for="item in settings?.retype"
                        :key="item.value"
                        :label="item.value"
                        :value="item.value"
                      />
                      <el-option key="" label="" value="" />
                    </el-select>
                  </el-col>
                  <el-col :span="6">
                    <el-select v-model="ele.retype" class="m-2" placeholder="Select" size="small" :disabled="!(settingPermissionList?.combineKeyList)">
                      <el-option
                        v-for="item2 in settings?.retype.find(
                          (item) => item.value === ele.retypeCatgory
                        )?.subs"
                        :key="item2.value"
                        :label="item2.value"
                        :value="item2.value"
                      />
                      <el-option key="" label="" value="" />
                    </el-select>
                  </el-col>
                </el-row>

                <!-- LSR Judge -->
                <el-row>
                  <el-col :span="2"> LSR Judge </el-col>
                  <el-col :span="4">
                    <el-select
                      v-model="ele.lsrJudgeColletion"
                      @change="ele.lsrJudge = ''"
                      class="m-2"
                      placeholder="Select"
                      size="small"
                      :disabled="!(settingPermissionList?.combineKeyList)"
                    >
                      <el-option
                        v-for="item in settings?.lsrJudge"
                        :key="item.value"
                        :label="item.value.toUpperCase()"
                        :value="item.value"
                      />
                      <el-option key="" label="" value="" />
                    </el-select>
                  </el-col>
                  <el-col :span="6">
                    <el-select v-model="ele.lsrJudge" class="m-2" placeholder="Select" size="small" :disabled="!(settingPermissionList?.combineKeyList)">
                      <el-option
                        v-for="item2 in settings?.lsrJudge.find(
                          (item) => item.value === ele.lsrJudgeColletion
                        )?.subs"
                        :key="item2.value"
                        :label="item2.value"
                        :value="item2.value"
                      />
                      <el-option key="" label="" value="" />
                    </el-select>
                  </el-col>
                </el-row>

                <!-- RP Flag -->
                <el-row>
                  <el-col :span="2"> RP Flag </el-col>
                  <el-col :span="4">
                    <el-select v-model="ele.rpFlag" class="m-2" placeholder="Select" size="small" :disabled="!(settingPermissionList?.combineKeyList)">
                      <el-option
                        v-for="item in settings?.rpFlag"
                        :key="item.value"
                        :label="item.name"
                        :value="item.value"
                      />
                      <el-option key="" label="" value="" />
                    </el-select>
                  </el-col>
                </el-row>

                <!-- LCV -->
                <el-row>
                  <el-col :span="2"> LCV </el-col>
                  <el-col :span="4">
                    <el-select
                      @change="
                        (val: string) => {
                          if (!val) return
                          ele.lcvList.push(val)
                        }
                      "
                      size="small"
                      placeholder="Select"
                      :disabled="!(settingPermissionList?.combineKeyList)"
                    >
                      <el-option
                        v-for="item in settings?.lcv"
                        :key="item.value"
                        :label="item.value"
                        :value="item.value"
                      />
                      <el-option label="" value="" />
                    </el-select>
                    <el-row class="vor-border-line" style="height: 175px; margin: 0px">
                      <el-col>
                        <el-scrollbar max-height="160px">
                          <template v-for="(item, index) in ele.lcvList" :key="index">
                            <el-button
                              @click="
                                () => {
                                  ele.lcvList.splice(index, 1)
                                }
                              "
                              size="small"
                              type="primary"
                              class="vor-btn"
                              style="margin-bottom: 5px"
                              :disabled="!(settingPermissionList?.combineKeyList)"
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
            </el-row>

            <!-- Condition -->
            <el-row>
              <el-col :span="23" class="vor-border-line">
                <el-table
                  :highlight-current-row="true"
                  :data="ele.conditionList"
                  style="width: 100%"
                  max-height="250"
                >
                  <el-table-column label="Combo Name" width="150px">
                    <template #default="scope">
                      <el-select
                        v-model="scope.row.comboName"
                        @change="
                          () => {
                            scope.row.penType = ''
                            scope.row.condition = ''
                          }
                        "
                        class="m-2"
                        placeholder="Select"
                        size="small"
                        :disabled="!(settingPermissionList?.combineKeyList)"
                      >
                        <el-option
                          v-for="item in settings?.conditionCombo"
                          :key="item.comboName"
                          :label="item.comboName"
                          :value="item.comboName"
                          :disabled="
                            ele.conditionList.find((c) => c.comboName == item.comboName)
                              ? true
                              : false
                          "
                        />
                        <el-option key="" label="" value="" />
                      </el-select>
                    </template>
                  </el-table-column>
                  <el-table-column label="Pen Type" width="100px">
                    <template #default="scope">
                      <el-select
                        v-model="scope.row.penType"
                        @change="
                          () => {
                            scope.row.condition = ''
                          }
                        "
                        :disabled="!scope.row.comboName || !(settingPermissionList?.combineKeyList) "
                        class="m-2"
                        placeholder="Select"
                        size="small"
                      >
                        <el-option key="point" label="point" value="point" />
                        <el-option key="line" label="line" value="line" />
                        <el-option key="block" label="block" value="block" />
                        <el-option key="" label="" value="" />
                      </el-select>
                    </template>
                  </el-table-column>
                  <el-table-column label="Condition" width="200px">
                    <template #default="scope">
                      <el-select
                        v-model="scope.row.condition"
                        :disabled="!scope.row.penType || !(settingPermissionList?.combineKeyList) "
                        class="m-2"
                        placeholder="Select"
                        size="small"
                      >
                        <el-option
                          v-for="item in filterCombineKeyCondition(scope.row.comboName,scope.row.penType)"
                          :key="item.condition"
                          :label="item.condition"
                          :value="item.condition"
                        />
                        <el-option key="" label="" value="" />
                      </el-select>
                    </template>
                  </el-table-column>
                  <el-table-column label="Operations">
                    <template #default="scope">
                      <el-button
                        link
                        type="primary"
                        size="small"
                        @click.prevent="removeCombineKeyCondition(scope.$index, ele.conditionList)"
                        :disabled="!(settingPermissionList?.combineKeyList) "
                      >
                        Remove
                      </el-button>
                    </template>
                  </el-table-column>
                </el-table>
                <el-button
                  class="mt-4"
                  style="width: 100%"
                  @click="addCombineKeyCondition(ele.conditionList)"
                  :disabled="!(settingPermissionList?.combineKeyList) "
                  >Add Item</el-button
                >
              </el-col>
            </el-row>
          </el-tab-pane>
        </el-tabs>
      </el-tab-pane>

      <!-- Run Params -->
      <el-tab-pane label="Run Params">
        <el-tabs>
          <el-row>
            <el-col :span="2">
              <el-text>Query Last </el-text>
            </el-col>
            <el-col :span="4">
              <el-input-number v-model="settings.queryHours" :min="1" :max="480" :step="1" :precision="0" size="small" :disabled="!(settingPermissionList?.runParams)"/>
            </el-col>
            <el-col :span="4">
              <el-text> Hours Data</el-text>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="8">
              <el-switch
                v-model="settings.runMode"
                active-text="Lot Mode"
                active-value="lot"
                inactive-text="Point Mode"
                inactive-value="point"
                :disabled="!(settingPermissionList?.runParams)"
              />
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="2">
              <el-text>Opacity</el-text>
            </el-col>
            <el-col :span="4">
              <el-input-number v-model="settings.ConditionOpacity"  :min="0" :max="1" :step="0.1" size="small" :disabled="!(settingPermissionList?.runParams)"></el-input-number>
            </el-col>
          </el-row>
        </el-tabs>
      </el-tab-pane>

      <!-- Macro Setting -->
      <el-tab-pane label="Macro">
        <el-card class="box-card" v-if="settings">
          <VueDraggable v-model="settings.macros" target="tbody" :disabled="!(settingPermissionList?.macros)">
            <el-table :data="settings?.macros" style="width: 100%" max-height="250" :highlight-current-row="true" >
              <el-table-column label="HotKey" width="100px">
                <template #default="scope" >
                  <el-checkbox
                    v-model="scope.row.isHotKey"
                    :disabled="!(settingPermissionList?.macros) || calcHotKeyDisabled(settings?.macros, scope.row,5)"
                  />
                </template>
              </el-table-column>
              <el-table-column label="Has value" width="100px">
                <template #default="scope">
                  <el-checkbox
                    v-model="scope.row.hasValue"
                    disabled/>
                </template>
              </el-table-column>
              <el-table-column label="Name" width="400px">
                <template #default="scope">
                  <el-input v-model="scope.row.name" placeholder="Please input" @change="checkForDuplicateMacrosName(scope.$index)" :disabled="!(settingPermissionList?.macros)"/>
                </template>
              </el-table-column>
              <el-table-column label="Operations">
                <template #default="scope">
                  <el-button
                    link
                    type="primary"
                    size="small"
                    @click.prevent = "macroIndex = scope.$index"
                  >
                    Select
                  </el-button>
                  <el-button
                    link
                    type="primary"
                    size="small"
                    @click.prevent="removeMacro(scope.$index)"
                    :disabled="!(settingPermissionList?.macros)"
                  >
                    Remove
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </VueDraggable>
          <el-button 
            class="mt-4" 
            style="width: 100%" 
            @click="settings?.macros.push({ name: '', value: [], isHotKey: false, hasValue: false, products: []})"
            :disabled="!(settingPermissionList?.macros)"
            >Add Item</el-button
          >
        </el-card>
        
        <el-tabs v-if="macroIndex >= 0" type="border-card">
          <!-- Combo Producut -->
          <el-tab-pane label="Producut">
            <el-card class="box-card">
              <el-table
                :data="settings?.macros[macroIndex].products"
                style="width: 100%"
                max-height="250"
              >
                <el-table-column label="Producut">
                  <template #default="scope">
                    <el-input v-model="scope.row.value" placeholder="Please input" :disabled="!(settingPermissionList?.macros)"/>
                  </template>
                </el-table-column>

                <el-table-column label="Operations" width="120">
                  <template #default="scope">
                    <el-button
                      link
                      type="primary"
                      size="small"
                      @click.prevent="removeMacroProduct(scope.$index)"
                      :disabled="!(settingPermissionList?.macros)"
                    >
                      Remove
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
              <el-button
                class="mt-4"
                style="width: 100%"
                @click="
                  () => {
                    settings?.macros[macroIndex].products.push({ value: '' })
                  }
                "
                :disabled="!(settingPermissionList?.macros)"
                >Add Item</el-button
              >
            </el-card>
          </el-tab-pane>
        </el-tabs>
      </el-tab-pane>

      <!-- LensColor -->
      <el-tab-pane label="LensColor">
        <el-table :data="settings?.lensColorMappingList" style="width: 100%" max-height="500">
          <el-table-column label="Lens" width="300px">
            <template #default="scope">
              <el-input v-model="scope.row.lens" placeholder="Please input" :disabled="!(settingPermissionList?.lensColor) || typeof checkLensInConditions(scope.$index)  === 'object'"/>
            </template>
          </el-table-column>
          <el-table-column label="Color" width="300px">
            <template #default="scope">
              <div style="display: flex; align-items: center;">
                <el-tag v-if="scope.row.color" :color="scope.row.color" style="margin-right: 10px; width:50px"/>
                <el-select 
                  v-model="scope.row.color"  
                  placeholder="Please input" 
                  @change = "handleLensChangeColor(scope.$index)"
                  :disabled="!(settingPermissionList?.lensColor)">
                  <el-option
                    v-for="item in settings.lensColors"
                    :key="item.hex"
                    :label="item.hex"
                    :value="item.hex"
                  >
                    <div class="flex items-center">
                      <el-tag :color="item.hex" style="margin-right: 10px; width:50px"/>
                      <span>{{ item.hex }}</span>
                    </div>
                  </el-option>
                </el-select>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="Operations">
            <template #default="scope">
              <el-button
                link
                type="primary"
                size="small"
                @click.prevent="removeLensColorMapping(scope.$index)"
                :disabled="!(settingPermissionList?.lensColor)"
              >
                Remove
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-button
          class="mt-4"
          style="width: 100%"
          @click="
            () => {
              settings?.lensColorMappingList.push({color: settings.lensColors[0].hex, lens: ''})
            }
          "
          :disabled="!(settingPermissionList?.lensColor)"
          >Add Item</el-button
        >
      </el-tab-pane>
    </el-tabs>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="save" type="primary">Save All</el-button>
        <el-button @click="$emit('close')">Cancel</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import LabelViewIO from '@/io/LabelViewIO'
import { useUserInfoStore } from '@/stores/userInfo'
import { ElMessage } from 'element-plus'
import { ref, toRef, watch } from 'vue'

import type { Props } from '@/types/UserSettings'
import type { LabelType } from '@/types/Label'
import { VueDraggable } from 'vue-draggable-plus'

const userInfoStore = useUserInfoStore()

const props = defineProps<Props>()
const emit = defineEmits(['save', 'close'])
const isShow = toRef(props, 'isShow')
const _isShow = ref(false) // 為了避免 el-dialog 的 v-model 直接引用 isShow 會報 Vue 3 警告
const settings = ref<LabelType.Setting>({
  retype: [],
  lcv: [],
  lsrJudge: [],
  conditionCombo: [],
  rpFlag: [],
  combineKeyList: [],
  queryHours: 0,
  runMode: '',
  ConditionOpacity: 0,
  macros: [],
  lensColorMappingList: [],
  lensColors: []
});
const permissionList = ref<LabelType.PermissionGroup>()
const settingPermissionList = ref<LabelType.settingPermissionList>()
const retypeIndex = ref(-1)
const lsrJudgeIndex = ref(-1)
const conditionComboIndex = ref(-1)
const macroIndex = ref(-1)
const activeTab = ref(sessionStorage.getItem('activeTab') || '0');//紀錄目前停在哪一頁

watch(activeTab, () => {
  sessionStorage.setItem('activeTab', activeTab.value);
}, { deep: true })

watch(settings, () => {
  sessionStorage.setItem('settings', JSON.stringify(settings.value));
}, { deep: true })

watch(isShow, async (newVal) => {
  if (!newVal) {
    _isShow.value = newVal
    return
  }
  setPermissionList() 
  resetIndex()
  const storSettings = sessionStorage.getItem('settings')
  if (storSettings !== null) {
    settings.value = JSON.parse(storSettings)
  }
  else {
    let data = (await LabelViewIO.getSettings()).data
    settings.value = {
      retype: data.retype,
      lcv: data.lcv,
      lsrJudge: data.lsrJudge,
      conditionCombo: data.conditionCombo,
      rpFlag: data.rpFlag,
      combineKeyList: data.combineKeyList,
      queryHours: data.queryHours,
      runMode: data.runMode,
      ConditionOpacity: data.ConditionOpacity,
      macros: data.macros,
      lensColorMappingList: data.lensColorMappingList,
      lensColors: data.lensColors
    }
  }
  macroValueNotEmpty()
  _isShow.value = newVal
})

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
    lensColor: isModifiable('LensColor'),
  };
}

function isModifiable(funcName: string) {
  if(permissionList.value) {
    const permission = permissionList.value.permissionList.find((perm: LabelType.Permission) => perm.funcName === funcName);
    return permission ? permission.modifiable : false;
  }
  return false;
}

function removeMacro(index: number) {
  macroIndex.value = -1
  settings.value?.macros.splice(index, 1)
}

function removeRetype(index: number) {
  retypeIndex.value = -1
  settings.value?.retype.splice(index, 1)
}

function removeRetypeSubs(index: number) {
  settings.value?.retype[retypeIndex.value].subs.splice(index, 1)
}

function removeLcv(index: number) {
  settings.value?.lcv.splice(index, 1)
}

// function removeLsrJudge(index: number) {
//   lsrJudgeIndex.value = -1
//   settings.value?.lsrJudge.splice(index, 1)
// }

function removeLsrJudgeSubs(index: number) {
  settings.value?.lsrJudge[lsrJudgeIndex.value].subs.splice(index, 1)
}

function addCombo(list: any[]) {
  let newConditionCombo = {
    comboName: '',
    products: [{ value: '' }],
    pointConditions: [],
    lineConditions: [],
    blockConditions: []
  }
  addCondition(newConditionCombo.pointConditions)
  addCondition(newConditionCombo.lineConditions)
  addCondition(newConditionCombo.blockConditions)
  list.push(newConditionCombo)
}

function addCondition(list: any[]) {
  list.push({
    sortNo: 0,
    condition: '',
    colors: '',
    moveMethod: '',
    runSteps: 0,
    sliter: 0,
    order: 0,
    lens: ''
  })
}

function removeCombo(index: number) {
  conditionComboIndex.value = -1
  settings.value?.conditionCombo.splice(index, 1)
}

function removeCondition<T>(list: T[] = [], index: number) {
  list.splice(index, 1)
}

function removeConditionProduct(index: number) {
  settings.value?.conditionCombo[conditionComboIndex.value].products.splice(index, 1)
}

function removeMacroProduct(index: number) {
  settings.value?.macros[macroIndex.value].products.splice(index, 1)
}

// 快速選單勾選四個後就Disable其他的CheckBox
function calcHotKeyDisabled<T>(list: T[] = [], row: any, limit: number) {
  return row.isHotKey ? false : list.filter((ele: any) => ele.isHotKey).length >= limit;
}

function removeRpFlag(index: number) {
  settings.value?.rpFlag.splice(index, 1)
}

function filterCombineKeyCondition(comboName: string, penType: string) {
  if(comboName!= null && penType!=null){
    const targetCombo = settings.value?.conditionCombo.find(
      (c) => c.comboName == comboName
    );
    if (!targetCombo) return [];
    let conditionsArray = null
    switch(penType){
      case 'block':
        conditionsArray = targetCombo.blockConditions;
        break;
      case 'line':
        conditionsArray = targetCombo.lineConditions;
        break;
      case 'point':
        conditionsArray = targetCombo.pointConditions;
        break;
    }
    return conditionsArray ?? [];
  }
  return [];
}

function addCombineKeyCondition(list: any[]) {
  list.push({
    comboName: '',
    penType: '',
    condition: ''
  })
}

function removeCombineKeyCondition(index: number, list: any[]) {
  list.splice(index, 1)
}

function macroValueNotEmpty() {
  settings.value?.macros.forEach((element) => {
    element.hasValue = element.value.length > 0
  });
}

function checkForDuplicateMacrosName(currentIndex: number) {
  let currentMacro = settings.value?.macros[currentIndex];
  const isDuplicateName = settings.value?.macros.some((macro, index) => {
    return currentIndex !== index && (macro.name ===  currentMacro?.name || "" ) ;
  });

  if (isDuplicateName) {
    if (currentMacro) {
      currentMacro.name = '';
    }
    ElMessage({
      showClose: true,
      message: 'Macro Name不可以重複',
      type: 'error'
    })
  }
}

function handleLensColor(list: any[], index: number) {
  const selectedConditionLens = list[index].lens;
  const mapping = settings.value?.lensColorMappingList.find(item => item.lens === selectedConditionLens);
  if (mapping) {
    list[index].color = mapping.color;
  } else {
    console.error('No matching lens found in lensColorMappingList');
  }
}

function checkLensInConditions(index: number):{comboName:string, type:string,conditionName:string}| undefined{
  function isPropMatched(comboList: any[],  val: string) {
    return comboList.find(item => item.lens === val);
  }
  
  let Mapping = settings.value?.lensColorMappingList[index]
  
  let isBlockPropMatched = null;
  let isLinePropMatched = null;
  let isPointPropMatched = null;
  let result ;

  settings.value?.conditionCombo.forEach((combo) => {
    isBlockPropMatched = isPropMatched(combo.blockConditions,  Mapping.lens);
    if (isBlockPropMatched) {
      result =  {comboName: combo.comboName, type:"Block", conditionName: isBlockPropMatched.condition}
    }
    
    isLinePropMatched = isPropMatched(combo.lineConditions, Mapping.lens);
    if (isLinePropMatched) {
      result = {comboName: combo.comboName, type:"Line", conditionName: isLinePropMatched.condition}
    }

    isPointPropMatched = isPropMatched(combo.pointConditions, Mapping.lens); 
    if (isPointPropMatched) {
      result = {comboName: combo.comboName, type:"Point", conditionName: isPointPropMatched.condition}
    }
  })

  return result;
}

function removeLensColorMapping(index: number) {
  let checkResult = checkLensInConditions(index)
  if (checkResult) {
    let comboName =  checkResult.comboName ;
    let conditionName =  checkResult.conditionName ;
    let type = checkResult.type ;
    ElMessage({
      showClose: true,
      message: "ComboName:" + comboName + " Type:" + type + " ConditionName:" + conditionName + " 已經使用這個lens",
      type: 'error'
    })
  }
  else {
    settings.value?.lensColorMappingList.splice(index, 1)
  }
  
}

function handleLensChangeColor(index: number) {
  var Mapping = settings.value?.lensColorMappingList[index]
  settings.value?.conditionCombo.forEach((combo) => {
    combo.blockConditions.forEach((condition) => {
      if (condition.lens ==  Mapping.lens){
        condition.color = Mapping.color;
      }
    })

    combo.lineConditions.forEach((condition) => {
      if (condition.lens ==  Mapping.lens){
        condition.color = Mapping.color;
      }
    })

    combo.pointConditions.forEach((condition) => {
      if (condition.lens ==  Mapping.lens){
        condition.color = Mapping.color;
      }
    })
  })
}

function resetIndex() {
  retypeIndex.value  = -1;
  lsrJudgeIndex.value  = -1;
  conditionComboIndex.value  = -1;
  macroIndex.value  = -1;
}

async function save() {
  await LabelViewIO.saveSettings(settings.value, userInfoStore.userId.value)
  
  sessionStorage.removeItem('settings')
  ElMessage({
    showClose: true,
    message: 'Save succeed',
    type: 'success'
  })

  emit('save')
}
</script>

<style scoped>
.el-row {
  margin-bottom: 10px;
}

.vor-border-line {
  border: 1px solid var(--el-border-color);
  border-radius: 5px;
  margin: 5px;
  padding: 5px;
}

.vor-btn {
  width: 100%;
}
</style>
