<template>
  <el-dialog v-model="_isShow" title="WipList" :show-close="true" :before-close="close" style="margin-top: 10px; margin-bottom: 10px; width: 100%; ">
    <el-tabs type="border-card" >
      <el-table :data="currentPageData" border style="width: 100%" :span-method="objectSpanMethod" id="wip_list_table" >
        <el-table-column prop="lotId" label="Lot ID" width="150">
          <template #default="scope">
            <el-button
              link
              type="primary"
              size="small"
              @click.prevent="searchImgData(scope.row.lotId)"
            >
             {{scope.row.lotId}}
            </el-button>
          </template>
        </el-table-column>
        <el-table-column label="Fully Auto拍圖中" width="150">
          <template #default="scope">
            <div :style="{ color: scope.row.capturing == true ? 'red' : '' }">
              {{ scope.row.capturing == true ? 'Y' : 'N' }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="sheetNum" label="片數" width="100"></el-table-column>
        <el-table-column prop="pointNum" label="點數" width="100"></el-table-column>
        <el-table-column prop="toolId" label="Tool ID" width="150"></el-table-column>
        <el-table-column prop="station" label="Station" width="150"></el-table-column>
        <el-table-column prop="prodName" label="Product Name" ></el-table-column>
        <el-table-column prop="chipId" label="Chip ID"></el-table-column>
        <el-table-column prop="dataAx" label="dataAx" width="150"></el-table-column>
        <el-table-column prop="gateAx" label="gateAx" width="150"></el-table-column>
        <el-table-column prop="dftMode" label="dftMode" width="100"></el-table-column>
        <el-table-column label="畫圖狀態" width="100">
          <template #default="scope">
            <div :style="{ color: scope.row.plotStatus == 'Done' ? 'green' : '' }">
              {{ scope.row.plotStatus}}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="opId" label="OP Id" width="100"></el-table-column>  
      </el-table>
      <div class="pagination-container">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-sizes="[5, 10, 20, 40]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="lotInfoList.length">
        </el-pagination>
      </div>
    </el-tabs>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="close">Close</el-button>
      </span>
    </template>
  </el-dialog>
</template>
  
<script lang="ts" setup>
import LabelViewIO from '@/io/LabelViewIO'
import { ref, toRef, watch, computed } from 'vue'
import type { Props, LotInfo, LotInfoDetail} from '@/types/WipList'


// const userInfoStore = useUserInfoStore()

const props = defineProps<Props>()
const emit = defineEmits(['close', 'searchImgData'])
const isShow = toRef(props, 'isShow')
const _isShow = ref(false) // 為了避免 el-dialog 的 v-model 直接引用 isShow 會報 Vue 3 警告
const queryHours = toRef(props, 'queryHours')
let currentPage = ref(1);
let pageSize = ref(10);
const originalData = ref<LotInfo[]>([]);
const lotInfoList = ref<LotInfoDetail[]>([]);
interface DataType {
  row: any;
  column: any;
  rowIndex: number;
  columnIndex: number;
}
const currentPageData = computed(() => {
  return lotInfoList.value.slice((currentPage.value - 1) * pageSize.value, currentPage.value * pageSize.value);
});

// 處理合併格式
const objectSpanMethod = ({ rowIndex, columnIndex }: DataType) => {
  if (columnIndex === 0 || columnIndex === 1 || columnIndex === 2 || columnIndex === 3) {
    const SpanArr = getSpanArr(currentPageData.value);
    const _row = SpanArr[rowIndex];
    const _col = _row > 0 ? 1 : 0;
    return {
          rowspan: _row,
          colspan: _col
    }
  }
};

const getSpanArr = (data: any[]) => {
  let spanArr = []
  let pos = 0
  for (var i = 0; i < data.length; i++) {
      if (i === 0) {
            spanArr.push(1);
            pos = 0
      } else {
        // 判断当前元素与上一个元素是否相同
        if (data[i].lotId === data[i - 1].lotId) {
          spanArr[pos] += 1;
          spanArr.push(0);
        } else {
          spanArr.push(1);
          pos = i;
        }
      }
  }
  return spanArr;
}
// 處理合併格式 end


watch(isShow, async (newVal) => {
  if (!newVal) {
    _isShow.value = newVal
    return
  }
  let data = (await LabelViewIO.getWipList(queryHours.value)).data
  originalData.value = data.lotInfoList;
  lotInfoList.value = [];
  handleData();
  _isShow.value = newVal
})

function handleSizeChange(val: number) {
  pageSize.value = val;
}

function handleCurrentChange(val: number) {
  currentPage.value = val;
}

function handleData() {
  originalData.value?.forEach((LotInfo) => {
    LotInfo.pointInfoList?.forEach((pointInfo) => {
      const data: LotInfoDetail = {
        lotId: LotInfo.lotId,
        capturing: LotInfo.capturing,
        sheetNum: LotInfo.sheetNum,
        pointNum: LotInfo.pointNum,
        toolId: pointInfo.toolId,
        station: pointInfo.station,
        prodName: pointInfo.prodName,
        chipId: pointInfo.chipId,
        dataAx: pointInfo.dataAx,
        gateAx: pointInfo.gateAx,
        dftMode: pointInfo.dftMode,
        plotStatus: pointInfo.plotStatus,
        opId: pointInfo.opId
      };
      lotInfoList.value.push(data)
    })
  })
}



//儲存
function searchImgData(lotId: string) {
  lotInfoList.value = [];
  emit('searchImgData', lotId);
}

function close(){
  emit('close')
}

</script>

<style scoped>
.pagination-container {
  margin-top: 10px;
  display: flex;
  justify-content: center;
}

.centerContent .cell {
  display: flex;
  align-items: center;
  justify-content: center;
}

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
::v-deep #wip_list_table .cell {
  text-align: center; 
  overflow: hidden; 
  white-space: nowrap; 
  text-overflow: ellipsis;
}

</style>
