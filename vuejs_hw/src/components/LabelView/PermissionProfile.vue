<template>
  <el-dialog v-model="_isShow" title="PermissionProfile" :show-close="false" :before-close="() => {}" style="margin-top: 10px; margin-bottom: 10px; width: 60%;">
    <el-tabs type="border-card" >
      <el-row>
        <el-col :span="6" heigh="10px">
          <el-input placeholder="search" v-model="searchString" @keyup.enter="searchIdAndGroup" clearable>
            <template #prepend>
              <el-button type="primary" size="small" :icon="Search" justify="center"  width="50%" @click="searchIdAndGroup"></el-button>
            </template>
          </el-input>
        </el-col>
      </el-row>
      <el-tab-pane label="Group">
        <el-row :gutter="10">
          <el-col :span="8" >
            <el-card class="box-card">
              <el-table 
                :highlight-current-row="true" 
                :data="filteredGroupList" 
                style="width: 100%" height="570" >
                <el-table-column label="Name" >
                  <template #default="scope">
                    <el-input 
                      v-model="scope.row.groupName" 
                      placeholder="Please input" 
                      :disabled="scope.row.groupName === 'Admin'"/>
                  </template>
                </el-table-column>
                <el-table-column label="Operations" style="width: 100%" >
                  <template #default="scope">
                    <el-button
                      link
                      type="primary"
                      size="small"
                      @click.prevent = "Index = scope.$index"
                    >
                      Select
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-card>
          </el-col>

          <el-col :span="8" >
            <el-card class="box-card">
              <el-table
                :data="Index === -1 ? null :  filteredGroupList?.[Index]?.permissionList"
                style="width: 100%"
                height="570"
              >
                <el-table-column label="Permission">
                  <template #default="scope">
                    {{scope.row.funcName}}
                  </template>
                </el-table-column>

                <el-table-column label="Modifiable" width="100px" align="center" >
                  <template #default="scope" >
                    <el-checkbox
                      :disabled=" filteredGroupList?.[Index]?.groupName === 'Admin'"
                      v-model="scope.row.modifiable"
                    />
                  </template>
                </el-table-column>
              </el-table>
            </el-card>
          </el-col>

          <el-col :span="8" >
            <el-card class="box-card">
              <el-table
                :data="Index === -1 || showSearchGroup.type == false
                      ? filteredGroupList?.[Index]?.memberList
                      : filteredGroupList?.[Index]?.memberList.filter((item, itemIndex) => itemIndex == showSearchGroup.index)"
                style="width: 100%"
                height="530"
              >
                <el-table-column label="ID">
                  <template #default="scope">
                    <el-input v-model="scope.row.id" placeholder="Please input" @change="checkForDuplicateId(scope.$index)" />
                  </template>
                </el-table-column>
                <el-table-column label="Operations" prop="id" width="100px">
                  <template #default="scope">
                    <el-button
                      link
                      type="primary"
                      size="small"
                      @click.prevent="removeMember(scope.$index)"
                    >
                      Remove
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
              <el-button
                class="mt-4"
                style="width: 100%" 
                :disabled="Index === -1 || showSearchGroup.type == true"
                @click="
                  () => {
                    filteredGroupList?.[Index].memberList.push({ id: '' })
                  }
                "
                >Add Item</el-button
              >
            </el-card>
          </el-col>
        </el-row>
      </el-tab-pane>
    </el-tabs>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="save" type="primary">Save All</el-button>
        <el-button @click="close">Cancel</el-button>
      </span>
    </template>
  </el-dialog>
</template>
  
<script lang="ts" setup>
import LabelViewIO from '@/io/LabelViewIO'
import { useUserInfoStore } from '@/stores/userInfo'
import { ElMessage } from 'element-plus'
import { ref, toRef, watch,computed } from 'vue'
import {Search} from '@element-plus/icons-vue'

import type { Props } from '@/types/PermissionProfile'
import type { LabelType } from '@/types/Label'

const userInfoStore = useUserInfoStore()

const props = defineProps<Props>()
const emit = defineEmits(['save', 'close'])
const isShow = toRef(props, 'isShow')
const _isShow = ref(false) // 為了避免 el-dialog 的 v-model 直接引用 isShow 會報 Vue 3 警告
const groupData = ref<LabelType.PermissionProfile>()
const Index = ref(-1)
const searchString = ref('')
const showSearchGroup = ref<{ type: boolean; groupId: number; userId: string; index: number }>({
  type: false,
  groupId: -1,
  userId: '',
  index: -1,
});
const filteredGroupList = computed(() => {    
  return groupData.value?.groupList.filter((group) =>
    !showSearchGroup.value.type||group.groupId === showSearchGroup.value.groupId)
  }
)

watch(searchString, () => {
  if(searchString.value == ''){
    resetPermissionProfile();    
  }
}, { deep: true })

watch(isShow, async (newVal) => {
  if (!newVal) {
    _isShow.value = newVal
    return
  }
  let data = (await LabelViewIO.getPermission()).data
  groupData.value = { groupList: data.groupList}
  _isShow.value = newVal
})

// 刪除ID
function removeMember(index: number) {
  if (filteredGroupList.value && Index.value >= 0) {
    if(showSearchGroup.value.index == -1){
      filteredGroupList.value[Index.value].memberList.splice(index, 1)
    }
    else{
      filteredGroupList.value[Index.value].memberList.splice(showSearchGroup.value.index, 1)
      resetPermissionProfile()
    }
  }
}

// 搜尋ID跟Group
function searchIdAndGroup() {
  //如果是空的就直接return
  if(searchString.value == ''){
    return
  }
  Index.value = 0;
  const searchResultTEST = groupData.value?.groupList.filter((group) =>
    group.memberList.some((member) => member.id === searchString.value)
  )
  const searchResult = searchResultTEST?searchResultTEST[0]:null
  if (searchResult==null) {
    ElMessage({
      showClose: true,
      message: 'UserID: ' + searchString.value + ' is not exist',
      type: 'warning'
    }) 
    searchString.value = '';
    return
  }
  if (filteredGroupList.value && showSearchGroup && searchResult) {
    showSearchGroup.value.type = true;
    showSearchGroup.value.groupId = searchResult.groupId;
    showSearchGroup.value.userId = searchString.value;
    showSearchGroup.value.index = filteredGroupList.value[Index.value].memberList.findIndex((member) => member.id === showSearchGroup.value.userId);
  }
}

// 重置搜尋的狀態
function resetPermissionProfile(){
  searchString.value = '';
  Index.value = -1;
  showSearchGroup.value.type = false;
  showSearchGroup.value.groupId = -1;
  showSearchGroup.value.userId = '';
  showSearchGroup.value.index = -1;
}

// 檢查ID格式及檢查是否重複綁定GROUP
function checkForDuplicateId(inputIndex: number) {
  if (filteredGroupList.value) {
    //if在搜尋狀態，傳進來都會是index=1，要做判斷
    const currentIndex = showSearchGroup.value.type? showSearchGroup.value.index: inputIndex;
    const groupList =filteredGroupList.value[Index.value] 
    groupList.memberList[currentIndex].id = convertFormatAndLetterCase(groupList.memberList[currentIndex].id)
    const currentMember = {
      groupId: groupList.groupId,
      id: groupList.memberList[currentIndex].id,
      index: currentIndex,
    };
    let duplicateMemberName = ''
    groupData.value?.groupList.forEach(group => {
      group.memberList.forEach((member, memberIndex) => {
        if((group.groupId !== currentMember.groupId || memberIndex !== currentMember.index) && member.id === currentMember.id){
          duplicateMemberName = group.groupName
        }
      });
    });
    if (duplicateMemberName !== '') {
      groupList.memberList[currentIndex].id = ''
      ElMessage({
        showClose: true,
        message: currentMember.id +' has exist in ' + duplicateMemberName,
        type: 'error'
      })
    }
  }
}

// 檢查輸入的ID，剔除特殊字元及全大寫
function convertFormatAndLetterCase(inputString: string): string {
  const specialCharsAndSpacesRegExp = /[^0-9A-Za-z]+/g;
  const filteredString = (inputString.replace(specialCharsAndSpacesRegExp, '')).toUpperCase();
  return filteredString;
}

//儲存
async function save() {
  resetPermissionProfile();
  await LabelViewIO.savePermission(groupData.value, userInfoStore.userId.value);
  ElMessage({
    showClose: true,
    message: 'Save succeed',
    type: 'success'
  })
  emit('save');
}

function close(){
  resetPermissionProfile();
  emit('close')
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
