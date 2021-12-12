<template>
  <div class="tab-container">
    <el-form ref="compositionForm" label-position="left" label-width="80px" :model="compositionForm">
      <el-row :gutter="8">
        <el-col :xs="{span: 24}" :sm="{span: 6}" :md="{span: 6}" :lg="{span: 6}" :xl="{span: 6}">
          <el-button style="margin: 0 10px 10px 0;" type="primary" icon="el-icon-upload" @click="handleImportJson">
            Import Json
          </el-button>
          <el-button style="margin: 0 10px 10px 0;" :loading="exportJsonLoading" type="primary" icon="el-icon-document" @click="handleExportJson">
            Export Json
          </el-button>
          <el-form-item label="组合名称">
            <el-tooltip class="item" :content="compositionForm.description" :disabled="!compositionForm.description" placement="bottom">
              <span>{{ compositionForm.name }}</span>
            </el-tooltip>
          </el-form-item>
          <el-form-item label="资金总额">
            <el-input v-model="compositionForm.allfund" type="number" placeholder="请输入内容" @change="updateState()" />
          </el-form-item>
          <el-form-item label="手续费">
            <el-input v-model="compositionForm.commission" type="number" :step="0.0001" min="0" max="0.1" placeholder="eg: 0.0005" @change="updateState()" />
          </el-form-item>
          <div class="timeline-panel">
            <el-timeline :reverse="false">
              <el-timeline-item
                v-for="(activity, activity_index) in compositionForm.activities"
                :key="activity_index"
                :timestamp="activity.timestamp"
              >
                <div v-for="(company, company_index) in activity.holdings_cur.slice(0,2)" :key="company_index">
                  {{ company.name }}: {{ company.share.toFixed(2) }}
                </div>
                <span v-if="activity.holdings_cur.length>2">
                  ......
                </span>
                <span v-if="activity.freecash_cur < 0" style="color: red; margin-left: 5px;">
                  !
                </span>
                <div class="edit" @click="editTimestamp( activity_index )">
                  <i class="el-icon-edit-outline" />
                </div>
                <div class="destroy" @click="destroyTimestamp( activity_index )">
                  <i class="el-icon-close" />
                </div>
              </el-timeline-item>
            </el-timeline>
            <div class="add" @click="addTimestamp()">
              <i class="el-icon-circle-plus" />
            </div>
          </div>
          <el-button
            style="margin:20px 0;"
            class="code-button-item"
            type="primary"
            @click.native.prevent="saveCompositionVisible=true"
          >Save Composition</el-button>
        </el-col>
        <el-col :xs="{span: 24}" :sm="{span: 18}" :md="{span: 18}" :lg="{span: 18}" :xl="{span: 18}">
          <el-row class="card-panel" v-if="Object.keys(indicators).length > 0">
            <el-col :xs="12" :sm="12" :lg="6" v-for="(indicator, key) in indicators" :key="key">
              <div style="margin: 8px 18px;">{{ key }} : {{ indicator }}</div>
            </el-col>
          </el-row>
          <el-row>
            <el-form ref="benchmarkForm" :inline="true" :model="benchmarkForm">
              <el-form-item>
                <el-autocomplete
                  v-model="benchmarkForm.ts_code"
                  :fetch-suggestions="queryIndexSearchAsync"
                  placeholder="Benchmark"
                  style="width: 220px;"
                  clearable
                  @select="handleIndexSelect($event)"
                  @clear="handleIndexClear($event)"
                  @input="handleIndexInput($event)"
                >
                  <template slot="suffix">{{ benchmarkForm.name }}</template>
                </el-autocomplete>
              </el-form-item>
            </el-form>
          </el-row>
          <el-row>
            <stack-line-pie-chart ref="StackLinePieChart" v-show="whichChart === 'StackLinePieChart'" />
            <stack-line-chart ref="StackLineChart" v-show="whichChart === 'StackLineChart'"/>
          </el-row>
        </el-col>
      </el-row>
      <el-row v-if="csvDataList.length>0">
        <el-button style="margin: 0 10px 10px 0;" :loading="downloadLoading" type="primary" icon="el-icon-document" :disabled="csvDataList.length===0" @click="handleDownload">
          Export CSV
        </el-button>
        <el-table
          ref="multipleTable"
          :key="tableKey"
          v-loading="csvDataListLoading"
          :data="csvDataList"
          border
          fit
          max-height="500"
          highlight-current-row
        >
          <el-table-column v-for="(column, index) in csvDataListColumns" :key="index" align="center" :prop="column" :label="column">
            <template slot-scope="scope">
              <span v-if="['cost', 'estimate'].indexOf(column) !== -1">{{ scope.row[column] | myParseFloat }}</span>
              <span v-else>{{ scope.row[column] }}</span>
            </template>
          </el-table-column>
        </el-table>
      </el-row>
    </el-form>

    <!-- 编辑弹出框 -->
    <el-dialog :visible.sync="editVisible" :title="isTimestampEdit ? 'Edit' : 'Add'" width="80vw" center>
      <el-form ref="compositionForm" :inline="true" :model="activityForm" class="edit_dialog">
        <el-row align="middle" type="flex" :gutter="6">
          <el-col :xs="{span: 4}" :sm="{span: 4}" :md="{span: 4}" :lg="{span: 4}" :xl="{span: 4}">
            <label>日期</label>
          </el-col>
          <el-col :xs="{span: 20}" :sm="{span: 10}" :md="{span: 10}" :lg="{span: 10}" :xl="{span: 10}">
            <el-date-picker
              v-model="activityForm.timestamp_temp"
              :readonly="isTimestampEdit?'readonly':false"
              :editable="false"
              format="yyyyMMdd"
              value-format="yyyyMMdd"
              type="date"
              placeholder="选择日期"
              style="width: 100%"
              @change="timestampOnChange($event)"
            />
          </el-col>
        </el-row>
        <hr>
        <el-row align="middle" type="flex" :gutter="6">
          <el-col :span="4">
            <label>初始<br class="hidden-sm-and-up">持仓</label>
          </el-col>
          <el-col :span="20">
            <el-row style="text-align: center;">
              <el-col :xs="{span: 8}" :sm="{span: 8}" :md="{span: 4}" :lg="{span: 4}" :xl="{span: 4}">股票</el-col>
              <el-col :xs="{span: 8}" :sm="{span: 8}" :md="{span: 4}" :lg="{span: 4}" :xl="{span: 4}">份额</el-col>
              <el-col :xs="{span: 8}" :sm="{span: 8}" :md="{span: 4}" :lg="{span: 4}" :xl="{span: 4}">成本价</el-col>
              <el-col :xs="{span: 8}" :sm="{span: 8}" :md="{span: 4}" :lg="{span: 4}" :xl="{span: 4}">成本</el-col>
              <el-col :xs="{span: 8}" :sm="{span: 8}" :md="{span: 4}" :lg="{span: 4}" :xl="{span: 4}">上期收盘价</el-col>
              <el-col :xs="{span: 8}" :sm="{span: 8}" :md="{span: 4}" :lg="{span: 4}" :xl="{span: 4}">上期市值</el-col>
            </el-row>
            <hr style="border:1px dashed #cccccc">
            <el-row v-for="(company, company_index) in activityForm.holdings_pre" :key="company_index" style="text-align: center;">
              <el-col :xs="{span: 8}" :sm="{span: 8}" :md="{span: 4}" :lg="{span: 4}" :xl="{span: 4}">{{ activityForm.holdings_pre[company_index].ts_code + activityForm.holdings_pre[company_index].name }}</el-col>
              <el-col :xs="{span: 8}" :sm="{span: 8}" :md="{span: 4}" :lg="{span: 4}" :xl="{span: 4}">{{ activityForm.holdings_pre[company_index].share }}</el-col>
              <el-col :xs="{span: 8}" :sm="{span: 8}" :md="{span: 4}" :lg="{span: 4}" :xl="{span: 4}">{{ activityForm.holdings_pre[company_index].cost / activityForm.holdings_pre[company_index].share | myParseFloat }}</el-col>
              <el-col :xs="{span: 8}" :sm="{span: 8}" :md="{span: 4}" :lg="{span: 4}" :xl="{span: 4}">{{ activityForm.holdings_pre[company_index].cost | myParseFloat }}</el-col>
              <el-col :xs="{span: 8}" :sm="{span: 8}" :md="{span: 4}" :lg="{span: 4}" :xl="{span: 4}">{{ activityForm.holdings_pre[company_index].close | myParseFloat }}</el-col>
              <el-col :xs="{span: 8}" :sm="{span: 8}" :md="{span: 4}" :lg="{span: 4}" :xl="{span: 4}">{{ activityForm.holdings_pre[company_index].share * activityForm.holdings_pre[company_index].close | myParseFloat }}</el-col>
            </el-row>
            <el-row v-if="activityForm.holdings_pre.length===0" style="text-align: center;">
              <el-col :span="24">Empty</el-col>
            </el-row>
            <hr style="border:1px dashed #cccccc">
            <el-row style="text-align: center;">
              <el-col :span="8">总持仓</el-col>
              <el-col :span="8" />
              <el-col :span="8">{{ activityForm.holdings_pre.reduce((total, item) => total + (item.estimate || item.cost), 0) | myParseFloat }}</el-col>
            </el-row>
            <hr style="border:1px dashed #cccccc">
            <el-row style="text-align: center;">
              <el-col :span="8">可用资金</el-col>
              <el-col :span="8" />
              <el-col :span="8">{{ activityForm.freecash_pre | myParseFloat }}</el-col>
            </el-row>
            <hr style="border:1px dashed #cccccc">
            <el-row style="text-align: center;">
              <el-col :span="8">总市值</el-col>
              <el-col :span="8" />
              <el-col :span="8">{{ activityForm.holdings_pre.reduce((total, item) => total + (item.estimate || item.cost), 0) + activityForm.freecash_pre | myParseFloat }}</el-col>
            </el-row>
          </el-col>
        </el-row>
        <hr>
        <el-row align="middle" type="flex" :gutter="6">
          <el-col :span="4">
            <label>股票<br class="hidden-sm-and-up">交易</label>
          </el-col>
          <el-col :span="20">
            <el-row style="padding: 0; text-align: center; flex-wrap: wrap;" align="middle" type="flex" :gutter="6">
              <el-col :xs="{span: 24}" :sm="{span: 12}" :md="{span: 4}" :lg="{span: 4}" :xl="{span: 4}">
                买/卖
              </el-col>
              <el-col :xs="{span: 24}" :sm="{span: 12}" :md="{span: 4}" :lg="{span: 4}" :xl="{span: 4}">
                股票
              </el-col>
              <el-col :xs="{span: 24}" :sm="{span: 12}" :md="{span: 4}" :lg="{span: 4}" :xl="{span: 4}">
                份额
              </el-col>
              <el-col :xs="{span: 24}" :sm="{span: 12}" :md="{span: 4}" :lg="{span: 4}" :xl="{span: 4}">
                股价
              </el-col>
              <el-col :xs="{span: 12}" :sm="{span: 6}" :md="{span: 2}" :lg="{span: 2}" :xl="{span: 2}">
                金额
              </el-col>
              <el-col :xs="{span: 12}" :sm="{span: 6}" :md="{span: 2}" :lg="{span: 2}" :xl="{span: 2}">
                可用资金
              </el-col>
              <el-col :xs="{span: 24}" :sm="{span: 12}" :md="{span: 4}" :lg="{span: 4}" :xl="{span: 4}">
                操作
              </el-col>
            </el-row>
            <hr style="border:1px dashed #cccccc">
            <draggable v-model="activityForm.companyOps" @change="dragCompany">
              <div v-for="(company, company_index) in activityForm.companyOps" :key="company_index">
                <el-row style="padding: 0; text-align: center; flex-wrap: wrap;" align="middle" type="flex" :gutter="6">
                  <el-col :xs="{span: 12}" :sm="{span: 12}" :md="{span: 4}" :lg="{span: 4}" :xl="{span: 4}">
                    <el-switch
                      v-model="activityForm.companyOps[company_index].operation"
                      style="display: inline-block"
                      inactive-color="#13ce66"
                      active-value="buy"
                      inactive-value="sell"
                      @change="computeActivityCur(activityForm)"
                    />
                    <span>{{ activityForm.companyOps[company_index].operation }}</span>
                  </el-col>
                  <el-col :xs="{span: 24}" :sm="{span: 12}" :md="{span: 4}" :lg="{span: 4}" :xl="{span: 4}">
                    <el-autocomplete
                      v-model="activityForm.companyOps[company_index].ts_code_temp"
                      :fetch-suggestions="queryCompanySearchAsync"
                      placeholder="股票"
                      style="width: 100%;"
                      clearable
                      @select="handleCompanySelect($event, company_index)"
                      @clear="handleCompanyClear($event, company_index)"
                      @input="handleCompanyInput($event, company_index)"
                    >
                      <template slot="suffix">{{ activityForm.companyOps[company_index].name }}</template>
                    </el-autocomplete>
                  </el-col>
                  <el-col :xs="{span: 24}" :sm="{span: 12}" :md="{span: 4}" :lg="{span: 4}" :xl="{span: 4}">
                    <el-input
                      v-model="activityForm.companyOps[company_index].share"
                      type="number"
                      step="100"
                      :disabled="!activityForm.companyOps[company_index].ts_code"
                      placeholder="股数"
                      clearable
                      @input="computeActivityCur(activityForm)"
                    >

                      <template slot="suffix">{{ activityForm.companyOps[company_index].share * activityForm.companyOps[company_index].price * 100 /
                        (activityForm.holdings_pre.reduce((total, item) => total + item.cost, activityForm.freecash_pre)) | myParseFloat }}%</template>
                    </el-input>
                  </el-col>
                  <el-col :xs="{span: 24}" :sm="{span: 12}" :md="{span: 4}" :lg="{span: 4}" :xl="{span: 4}">
                    <el-popover
                      placement="top-start"
                      :title="activityForm.companyOps[company_index].ts_code + '' + activityForm.companyOps[company_index].name"
                      trigger="hover"
                      :disabled="!activityForm.companyOps[company_index].ts_code"
                    >
                      <template v-if="activityForm.companyOps[company_index].info" class="tips-content">
                        <el-form label-position="left" label-width="60px">
                          <el-form-item v-for="(value, key) in activityForm.companyOps[company_index].info" :key="key" style="margin: 0;" :label="key">{{ value }}</el-form-item>
                        </el-form>
                      </template>
                      <el-input
                        slot="reference"
                        v-model="activityForm.companyOps[company_index].price"
                        type="number"
                        step="0.01"
                        :disabled="!activityForm.companyOps[company_index].ts_code"
                        clearable
                        placeholder="股价"
                        @input="computeActivityCur(activityForm)"
                      />
                    </el-popover>
                  </el-col>
                  <el-col :xs="{span: 12}" :sm="{span: 6}" :md="{span: 2}" :lg="{span: 2}" :xl="{span: 2}">
                    {{ activityForm.companyOps[company_index].price * activityForm.companyOps[company_index].share | myParseFloat }}
                  </el-col>
                  <el-col :xs="{span: 12}" :sm="{span: 6}" :md="{span: 2}" :lg="{span: 2}" :xl="{span: 2}">
                    {{ activityForm.companyOps.slice(0, company_index + 1).reduce((total, item) => total +
                                                                                    (item.operation === 'buy' ? -1 : 1) * Number(item.share || 0) * Number(item.price || 0),
                                                                                  activityForm.freecash_pre) | myParseFloat }}
                  </el-col>
                  <el-col :xs="{span: 12}" :sm="{span: 6}" :md="{span: 2}" :lg="{span: 2}" :xl="{span: 2}">
                    <svg-icon class="drag-handler" icon-class="drag" />
                  </el-col>
                  <el-col :xs="{span: 12}" :sm="{span: 6}" :md="{span: 2}" :lg="{span: 2}" :xl="{span: 2}">
                    <el-button
                      type="text"
                      icon="el-icon-delete"
                      @click="deleteCompany($event, company_index)"
                    >remove
                    </el-button>
                  </el-col>
                </el-row>
                <hr style="border:1px dashed #cccccc">
              </div>
            </draggable>
            <el-row>
              <el-button :disabled="!activityForm.timestamp" type="primary" plain @click="addCompany()">Add</el-button>
            </el-row>
          </el-col>
        </el-row>
        <hr>
        <el-row align="middle" type="flex" :gutter="6">
          <el-col :xs="{span: 4}" :sm="{span: 4}" :md="{span: 4}" :lg="{span: 4}" :xl="{span: 4}">
            <label>当前<br class="hidden-sm-and-up">持仓</label>
          </el-col>
          <el-col :xs="{span: 20}" :sm="{span: 20}" :md="{span: 20}" :lg="{span: 20}" :xl="{span: 20}">
            <el-row style="text-align: center;">
              <el-col :xs="{span: 8}" :sm="{span: 8}" :md="{span: 4}" :lg="{span: 4}" :xl="{span: 4}">股票</el-col>
              <el-col :xs="{span: 8}" :sm="{span: 8}" :md="{span: 4}" :lg="{span: 4}" :xl="{span: 4}">份额</el-col>
              <el-col :xs="{span: 8}" :sm="{span: 8}" :md="{span: 4}" :lg="{span: 4}" :xl="{span: 4}">成本价</el-col>
              <el-col :xs="{span: 8}" :sm="{span: 8}" :md="{span: 4}" :lg="{span: 4}" :xl="{span: 4}">成本</el-col>
              <el-col :xs="{span: 8}" :sm="{span: 8}" :md="{span: 4}" :lg="{span: 4}" :xl="{span: 4}">收盘价</el-col>
              <el-col :xs="{span: 8}" :sm="{span: 8}" :md="{span: 4}" :lg="{span: 4}" :xl="{span: 4}">市值</el-col>
            </el-row>
            <hr style="border:1px dashed #cccccc">
            <el-row v-for="(company, company_index) in activityForm.holdings_cur" :key="company_index" style="text-align: center;">
              <el-col :xs="{span: 8}" :sm="{span: 8}" :md="{span: 4}" :lg="{span: 4}" :xl="{span: 4}">{{ company.ts_code + company.name }}</el-col>
              <el-col :xs="{span: 8}" :sm="{span: 8}" :md="{span: 4}" :lg="{span: 4}" :xl="{span: 4}">{{ company.share }}</el-col>
              <el-col :xs="{span: 8}" :sm="{span: 8}" :md="{span: 4}" :lg="{span: 4}" :xl="{span: 4}">{{ company.cost / company.share | myParseFloat }}</el-col>
              <el-col :xs="{span: 8}" :sm="{span: 8}" :md="{span: 4}" :lg="{span: 4}" :xl="{span: 4}">{{ company.cost | myParseFloat }}</el-col>
              <el-col :xs="{span: 8}" :sm="{span: 8}" :md="{span: 4}" :lg="{span: 4}" :xl="{span: 4}">{{ activityForm.holdings_cur[company_index].close | myParseFloat }}</el-col>
              <el-col :xs="{span: 8}" :sm="{span: 8}" :md="{span: 4}" :lg="{span: 4}" :xl="{span: 4}">{{ activityForm.holdings_cur[company_index].share * activityForm.holdings_cur[company_index].close | myParseFloat }}</el-col>
            </el-row>
            <el-row v-if="activityForm.holdings_cur.length===0" style="text-align: center;">
              <el-col :span="24">Empty</el-col>
            </el-row>
            <hr style="border:1px dashed #cccccc">
            <el-row style="text-align: center;">
              <el-col :span="8">总持仓</el-col>
              <el-col :span="8" />
              <el-col :span="8">{{ activityForm.holdings_cur.reduce((total, item) => total + ((item.share * item.close) || item.cost), 0) | myParseFloat }}</el-col>
            </el-row>
            <hr style="border:1px dashed #cccccc">
            <el-row style="text-align: center;">
              <el-col :span="8">可用资金</el-col>
              <el-col :span="8" />
              <el-col :span="8">{{ activityForm.freecash_cur | myParseFloat }}</el-col>
            </el-row>
            <hr style="border:1px dashed #cccccc">
            <el-row style="text-align: center;">
              <el-col :span="8">总市值</el-col>
              <el-col :span="8" />
              <el-col :span="8">{{ activityForm.holdings_cur.reduce((total, item) => total + ((item.share * item.close) || item.cost), 0) + activityForm.freecash_cur | myParseFloat }}</el-col>
            </el-row>
          </el-col>
        </el-row>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button :disabled="!activityForm.timestamp" type="primary" @click="submitTimestamp">Submit</el-button>
      </span>
    </el-dialog>

    <!-- 删除提示框 -->
    <el-dialog :visible.sync="delVisible" title="Delete" width="300px" center>
      <div class="del-dialog-cnt">Are you confirm to remove the data?</div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="confirmDestroyTimestamp">OK</el-button>
        <el-button @click="delVisible = false">Cancel</el-button>
      </span>
    </el-dialog>

    <!-- 保存弹出框 -->
    <el-dialog :visible.sync="saveCompositionVisible" :title="isEdit ? 'Edit' : 'Add'" width="80vw" center>
      <el-form ref="composition" :model="compositionForm" :rules="rules" label-position="left" label-width="120px">
        <el-form-item label="组合名称" prop="name">
          <el-input v-model="compositionForm.name" placeholder="请输入名称" />
        </el-form-item>
        <el-form-item label="组合介绍">
          <el-input v-model="compositionForm.description" type="textarea" placeholder="请输入介绍" />
        </el-form-item>
        <el-form-item>
          <span class="dialog-footer">
            <el-button style="margin-top: 10px;" size="small" type="primary" @click="saveComposition()">Submit</el-button>
            <el-button size="small" @click="saveCompositionVisible=false">Cancel</el-button>
          </span>
        </el-form-item>
      </el-form>
    </el-dialog>

    <!-- 上传框 -->
    <el-dialog :visible.sync="importJsonVisible" title="Upload" width="450px" center>
      <el-form ref="uploadForm" :model="uploadForm">
        <el-form-item>
          <el-upload
            ref="upload"
            :http-request="uploadFileMethod"
            :on-preview="handlePreview"
            :on-remove="handleRemove"
            :on-change="handleChange"
            :file-list="fileList"
            :auto-upload="false"
            :limit="2"
            class="upload-demo"
            style="width: 360px"
            drag
            name="file"
            accept=".json"
            action="/api/datasets/"
          >
            <i class="el-icon-upload" />
            <div class="el-upload__text">Drag your file here to begin or
              <em>click to browse</em>
            </div>
            <div slot="tip" class="el-upload__tip">Please upload Json file</div>
          </el-upload>
          <span class="dialog-footer">
            <el-button style="margin-top: 10px;" size="small" type="success" @click="submitUpload">Submit</el-button>
          </span>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import { queryCompanies } from '@/api/stockBasic'
import { calculateComposition, getCompositionInfo, fetchItem, createItem, updateItem } from '@/api/composition'
import { getCompanyHistData } from '@/api/histData'
import StackLineChart from './StackLineChart'
import StackLinePieChart from './StackLinePieChart'
import draggable from 'vuedraggable'
import 'element-ui/lib/theme-chalk/display.css'
import { queryIndexes } from '@/api/stockBasic'
import { getIndexHistData } from '@/api/histData'

const formatDate = function(timestamp, format = 'yyyyMMdd') {
  const date = new Date(timestamp)
  const o = {
    'y+': date.getFullYear(),
    'M+': date.getMonth() + 1, // 月份 "d+": value.getDate(), // 日
    'd+': date.getDate(),
    'h+': date.getHours(), // 小时 "m+": value.getMinutes(), // 分 "s+": value.getSeconds(), // 秒
    'm+': date.getMinutes(),
    's+': date.getSeconds()
  }
  if (/(y+)/.test(format)) {
    format = format.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
  }
  for (const k in o) {
    if (new RegExp('(' + k + ')').test(format)) {
      format = format.replace(
        RegExp.$1,
        RegExp.$1.length === 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length)
      )
    }
  }
  return format
}
const typeOf = function(obj) {
  const toString = Object.prototype.toString
  const map = {
    '[object Boolean]': 'boolean',
    '[object Number]': 'number',
    '[object String]': 'string',
    '[object Function]': 'function',
    '[object Array]': 'array',
    '[object Date]': 'date',
    '[object RegExp]': 'regExp',
    '[object Undefined]': 'undefined',
    '[object Null]': 'null',
    '[object Object]': 'object'
  }
  return map[toString.call(obj)]
}
const deepCopy = function(data) {
  const t = typeOf(data)
  let o

  if (t === 'array') {
    o = []
  } else if (t === 'object') {
    o = {}
  } else {
    return data
  }

  if (t === 'array') {
    for (let i = 0; i < data.length; i++) {
      o.push(deepCopy(data[i]))
    }
  } else if (t === 'object') {
    for (var i in data) {
      o[i] = deepCopy(data[i])
    }
  }
  return o
}

export default {
  name: 'CompositionDetail',
  components: {
    StackLineChart,
    draggable,
    StackLinePieChart
  },
  filters: {
    myParseFloat: function(value) {
      var num = parseFloat(value)
      return isNaN(num) ? 0 : Math.round(num * 100) / 100
      // return isNaN(num) ? 0 : num.toFixed(2)
    },
    ss: function(value) {
      return value * 100
    }
  },
  props: {
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    whichChart() {
      if (this.lineChartData.ts_code_list.length >= 10) {
        return 'StackLinePieChart'
      } else {
        return 'StackLineChart'
      }
    }
  },
  data() {
    return {
      tableKey: 0,
      compositionForm: {
        id: undefined,
        name: 'composition',
        description: undefined,
        allfund: 100000000,
        commission: 0.0001,
        activities: []
      },
      jsonDict: {},
      activityForm: {
        companyOps: [],
        timestamp_temp: undefined,
        timestamp: undefined,
        freecash_pre: undefined,
        freecash_cur: undefined,
        holdings_pre: [],
        holdings_cur: []
      },
      deleteTimestampForm: {
        index: undefined
      },
      reverse: true,
      lineChartData: {
        time_line: [],
        ts_code_list: [],
        name_list: [],
        close_data: []
      },
      indicators: {
      },
      benchmarkForm: {
        ts_code: undefined,
        name: undefined,
        type: 'index',
        hist_data: []
      },
      csvDataList: [],
      csvDataListColumns: [],
      listLoading: false,
      importJsonVisible: false,
      exportJsonLoading: false,
      downloadLoading: false,
      editVisible: false,
      isTimestampEdit: false,
      delVisible: false,
      saveCompositionVisible: false,
      rules: {
        name: [
          { required: true, message: '请输入组合名称', trigger: 'blur' },
          { min: 2, max: 30, message: '长度在 2 到 30 个字符', trigger: 'blur' }
        ]
      },
      tempRoute: {},

      uploadForm: {
        id: undefined,
        name: '',
        file: undefined
      },
      fileList: []
    }
  },
  async created() {
    if (this.isEdit) {
      this.compositionForm.id = this.$route.params && this.$route.params.id
      this.jsonDict = Object.assign({}, await this.fetchData(this.compositionForm.id))

      var msg = this.$message({
        duration: 0,
        showClose: false,
        message: 'Parse json'
      })
      getCompositionInfo(this.jsonDict).then(response => {
        this.compositionForm = response
      }).then(() => {
        msg.close()
        this.updateActivities()
        this.updateState()
        this.importJsonVisible = false
      })
        .catch(
          error => {
            msg.close()
            msg = this.$message({
              showClose: true,
              message: error,
              type: 'Error'
            })
          }
        )
    } else {
      this.updateActivities()
      this.updateState()
    }

    // Why need to make a copy of this.$route here?
    // Because if you enter this page and quickly switch tag, may be in the execution of the setTagsViewTitle function, this.$route is no longer pointing to the current page
    // https://github.com/PanJiaChen/vue-element-admin/issues/1221
    this.tempRoute = Object.assign({}, this.$route)
  },
  updated() {
    this.setTagsViewTitle() // set tagsview title
    this.setPageTitle() // set page title
  },
  methods: {
    fetchData(id) {
      return new Promise(resolve => {
        fetchItem(id).then(response => {
          resolve(response)
        })
      })
    },
    addTimestamp() {
      this.activityForm = {
        companyOps: [],
        timestamp_temp: undefined,
        timestamp: undefined,
        freecash_pre: undefined,
        freecash_cur: undefined,
        holdings_pre: [],
        holdings_cur: []
      }
      this.editVisible = true
      this.isTimestampEdit = false
    },
    editTimestamp(index) {
      this.activityForm = deepCopy(this.compositionForm.activities[index])
      this.editVisible = true
      this.isTimestampEdit = true
    },
    submitTimestamp() {
      var companyOps = []
      for (var companyOp of this.activityForm.companyOps) {
        if (Number(companyOp.share || 0) * Number(companyOp.price || 0) > 0) {
          companyOps.push(Object.assign({}, companyOp))
        }
      }
      if (companyOps.length === 0) {
        this.$message({
          showClose: true,
          message: 'No trade operations',
          type: 'Error'
        })
        return
      }
      this.activityForm.companyOps = Object.assign([], companyOps)
      this.activityForm = this.computeActivityCur(this.activityForm)

      var flag = -1
      if (this.isTimestampEdit) { // edit an activity
        for (let i = 0; i < this.compositionForm.activities.length; i++) {
          if (this.activityForm.timestamp === this.compositionForm.activities[i].timestamp) {
            this.compositionForm.activities.splice(i, 1, Object.assign({}, this.activityForm))
            flag = i
            break
          }
        }
      } else { // add an activity
        for (let i = 0; i < this.compositionForm.activities.length; i++) {
          if (this.activityForm.timestamp < this.compositionForm.activities[i].timestamp) {
            // add an activity between the list
            this.compositionForm.activities.splice(i, 0, Object.assign({}, this.activityForm))
            flag = i
            break
          }
        }
        if (flag === -1) {
          // add an activity at the end of the list
          this.compositionForm.activities.splice(this.compositionForm.activities.length, 0, Object.assign({}, this.activityForm))
          flag = this.compositionForm.activities.length
        }
      }
      this.editVisible = false
      this.updateActivities(0, true)
      this.updateState()
    },
    destroyTimestamp(index) {
      this.deleteTimestampForm.index = index
      this.delVisible = true
    },
    confirmDestroyTimestamp() {
      this.compositionForm.activities.splice(this.deleteTimestampForm.index, 1)
      this.delVisible = false
      this.updateActivities(0, true)
      this.updateState()
    },
    addCompany(item) {
      this.activityForm.companyOps.push({
        operation: 'buy',
        ts_code: undefined,
        ts_code_temp: undefined,
        name: undefined,
        share: 0,
        info: undefined
      })
    },
    dragCompany(event) {
      this.activityForm = this.computeActivityCur(this.activityForm)
    },
    deleteCompany(item, company_index) {
      this.activityForm.companyOps.splice(company_index, 1)
      this.activityForm = this.computeActivityCur(this.activityForm)
    },
    queryCompanySearchAsync(queryString, cb) {
      queryCompanies({ q: queryString }).then(response => {
        var list = []
        for (const item of response.results) {
          list.push({
            value: item.ts_code + ' ' + item.name,
            ts_code: item.ts_code,
            name: item.name
          })
        }
        cb(list)
      })
    },
    handleCompanySelect(event, company_index) {
      this.activityForm.companyOps[company_index].ts_code_temp = event.ts_code
      this.activityForm.companyOps[company_index].ts_code = event.ts_code
      this.activityForm.companyOps[company_index].name = event.name
      var param = { trade_date: this.activityForm.timestamp }
      getCompanyHistData(this.activityForm.companyOps[company_index].ts_code, param).then(response => {
        if (response.hist_data[0]) {
          this.activityForm.companyOps[company_index].info = {
            date: response.hist_data[0][0],
            open: response.hist_data[0][1],
            close: response.hist_data[0][2],
            high: response.hist_data[0][3],
            low: response.hist_data[0][4]
          }
          this.activityForm.companyOps[company_index].price = response.hist_data[0][1]
          this.activityForm = this.computeActivityCur(this.activityForm)
        } else {
          this.activityForm.companyOps[company_index].info = undefined
          this.activityForm.companyOps[company_index].price = undefined
          this.activityForm.companyOps[company_index].share = undefined
          this.activityForm = this.computeActivityCur(this.activityForm)
        }
      })
    },
    handleCompanyClear(event, company_index) {
      this.activityForm.companyOps[company_index].ts_code_temp = undefined
      this.activityForm.companyOps[company_index].ts_code = undefined
      this.activityForm.companyOps[company_index].name = undefined
      this.activityForm.companyOps[company_index].share = undefined
      this.activityForm.companyOps[company_index].price = undefined
      this.activityForm.companyOps[company_index].info = undefined
      this.activityForm = this.computeActivityCur(this.activityForm)
    },
    handleCompanyInput(event, company_index) {
      if (event === '') {
        this.handleCompanyClear(event, company_index)
      }
    },
    timestampOnChange(event) {
      for (let i = 0; i < this.compositionForm.activities.length; i++) {
        if (this.activityForm.timestamp_temp === this.compositionForm.activities[i].timestamp) {
          this.$message({
            showClose: true,
            message: 'Timestamp duplicated',
            type: 'Error'
          })
          this.activityForm.timestamp_temp = this.activityForm.timestamp
          return
        }
      }
      if (this.activityForm.companyOps.length > 0) {
        this.$confirm('改变日期会清空股票交易操作', 'Warning', {
          cancelButtonText: 'Cancel',
          confirmButtonText: 'Submit',
          type: 'warning'
        }).then(() => {
          this.$message({
            type: 'success',
            message: '已更改日期'
          })
          this.activityForm.companyOps = []
          this.activityForm = this.computeActivityCur(this.activityForm)
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '未更改日期'
          })
          this.activityForm.timestamp_temp = this.activityForm.timestamp
        })
      }
      this.activityForm.timestamp = this.activityForm.timestamp_temp
      if (!this.isTimestampEdit) {
        var activity_index = this.compositionForm.activities.length
        for (let i = 0; i < this.compositionForm.activities.length; i++) {
          if (this.activityForm.timestamp < this.compositionForm.activities[i].timestamp) {
            activity_index = i
            break
          }
        }
        if (activity_index === 0) {
          this.activityForm.holdings_pre = []
          this.activityForm.freecash_pre = this.compositionForm.allfund
        } else {
          this.activityForm.holdings_pre = deepCopy(this.compositionForm.activities[activity_index - 1].holdings_cur)
          this.activityForm.freecash_pre = deepCopy(this.compositionForm.activities[activity_index - 1].freecash_cur)
        }
      }
    },
    getCompanyIndexByTsCode(companies, ts_code) {
      for (let i = 0; i < companies.length; i++) {
        if (companies[i].ts_code === ts_code) {
          return i
        }
      }
      return -1
    },
    computeActivityCur(activityForm) {
      var freecash_cur = activityForm.freecash_pre
      var holdings_cur = deepCopy(activityForm.holdings_pre)
      for (var companyOp of activityForm.companyOps) {
        var company_index = this.getCompanyIndexByTsCode(holdings_cur, companyOp.ts_code)
        var operationSign = (companyOp.operation === 'buy') ? -1 : 1

        if (company_index !== -1) {
          holdings_cur[company_index].share -= operationSign * Number(companyOp.share || 0)
          holdings_cur[company_index].cost -= operationSign * Number(companyOp.share || 0) * Number(companyOp.price || 0)
          if (holdings_cur[company_index].share === 0) {
            holdings_cur.splice(company_index, 1)
          }
        } else {
          holdings_cur.push({
            ts_code: companyOp.ts_code,
            name: companyOp.name,
            share: -operationSign * Number(companyOp.share || 0),
            cost: -operationSign * Number(companyOp.share || 0) * Number(companyOp.price || 0)
          })
        }
        freecash_cur += operationSign * Number(companyOp.share || 0) * Number(companyOp.price || 0)
      }
      for (let i = 0; i < holdings_cur.length; i++) {
        var index_Op = this.getCompanyIndexByTsCode(activityForm.companyOps, holdings_cur[i].ts_code)
        var index_pre = this.getCompanyIndexByTsCode(activityForm.holdings_pre, holdings_cur[i].ts_code)
        holdings_cur[i].close = index_Op !== -1 && activityForm.companyOps[index_Op].info ? activityForm.companyOps[index_Op].info.close
          : index_pre !== -1 ? activityForm.holdings_pre[index_pre].close : 0
        holdings_cur[i].estimate = holdings_cur[i].close * holdings_cur[i].share
      }
      activityForm.holdings_cur = holdings_cur
      activityForm.freecash_cur = freecash_cur
      return deepCopy(activityForm)
    },
    updateActivities(flag = 0, refreshCurrent = false) {
      for (let i = flag; i < this.compositionForm.activities.length; i++) {
        for (let j = 0; j < this.compositionForm.activities[i].companyOps.length; j++) {
          this.compositionForm.activities[i].companyOps[j].ts_code_temp = this.compositionForm.activities[i].companyOps[j].ts_code
        }
        if (i === 0) {
          this.compositionForm.activities[i].freecash_pre = this.compositionForm.allfund
          this.compositionForm.activities[i].holdings_pre = []
        } else {
          this.compositionForm.activities[i].freecash_pre = this.compositionForm.activities[i - 1].freecash_cur
          this.compositionForm.activities[i].holdings_pre = this.compositionForm.activities[i - 1].holdings_cur
        }
        this.compositionForm.activities[i].timestamp_temp = this.compositionForm.activities[i].timestamp
        if (refreshCurrent) {
          this.compositionForm.activities[i] = this.computeActivityCur(this.compositionForm.activities[i])
        }
      }
    },
    updateDataFrame() {
      this.csvDataListLoading = true
      this.csvDataList = []
      this.csvDataListColumns = ['trade_date', 'ts_code', 'name', 'operation', 'share', 'price', 'cost', 'close', 'estimate']
      for (var activity of this.compositionForm.activities) {
        this.csvDataList.push({
          trade_date: activity.timestamp,
          name: '总市值',
          cost: activity.holdings_cur.reduce((total, item) => total + item.cost, activity.freecash_cur),
          estimate: activity.holdings_cur.reduce((total, item) => total + item.share * item.close, activity.freecash_cur)
        })
        this.csvDataList.push({
          trade_date: activity.timestamp,
          name: '可用资金',
          cost: activity.freecash_cur,
          estimate: activity.freecash_cur
        })
        for (var companyOp of activity.companyOps) {
          this.csvDataList.push({
            trade_date: activity.timestamp,
            ts_code: companyOp.ts_code,
            name: companyOp.name,
            operation: companyOp.operation,
            share: companyOp.share,
            price: companyOp.price,
            cost: companyOp.share * companyOp.price,
            close: companyOp.info ? companyOp.info.close : undefined,
            estimate: companyOp.info ? companyOp.info.close * companyOp.share : undefined
          })
        }
      }
      this.csvDataListLoading = false
    },
    updateState() {
      this.updateDataFrame()
      var msg = this.$message({
        duration: 0,
        showClose: false,
        message: 'Update charts'
      })
      calculateComposition(this.compositionForm).then(response => {
        this.lineChartData = Object.assign({}, response.lineChartData)
        this.indicators = Object.assign({}, response.indicators)
        this.addBenchmarkData(false, true)
        msg.close()
      })
        .catch(
          error => {
            msg.close()
            msg = this.$message({
              showClose: true,
              message: error,
              type: 'Error'
            })
          }
        )
    },
    setTagsViewTitle() {
      const route = Object.assign({}, this.tempRoute, { title: this.isEdit ? `${'Edit Composition'} - ${this.compositionForm.id}` : `${'Create Composition'}` })
      this.$store.dispatch('tagsView/updateVisitedView', route)
    },
    setPageTitle() {
      document.title = this.isEdit ? `${'Edit Composition'} - ${this.compositionForm.id}` : `${'Create Composition'}`
    },
    saveComposition() {
      this.$refs['composition'].validate((valid) => {
        if (valid) {
          if (this.isEdit) {
            updateItem(this.compositionForm.id, this.compositionFormSimple(this.compositionForm))
              .then(
                response => {
                  this.$message({
                    message: 'Successful saved composition',
                    type: 'Success'
                  })
                  this.saveCompositionVisible = false
                }
              )
              .catch(
                error => {
                  this.$message({
                    showClose: true,
                    message: error,
                    type: 'Error'
                  })
                })
          } else {
            createItem(this.compositionFormSimple(this.compositionForm))
              .then(
                response => {
                  this.$message({
                    message: 'Successful saved composition',
                    type: 'Success'
                  })
                  this.saveCompositionVisible = false
                  this.$router.push({
                    path: '/composition/edit/' + response.id
                  })
                }
              )
              .catch(
                error => {
                  this.$message({
                    showClose: true,
                    message: error,
                    type: 'Error'
                  })
                }
              )
          }
        }
      })
    },
    handleChange(file) {
      this.fileList.splice(0, this.fileList.length)
      this.uploadForm.name = file.name
      this.fileList.push(file)
    },
    handleRemove(file, fileList) {
      console.log(file, fileList)
    },
    handlePreview(file) {
      console.log(file)
    },
    submitUpload(param) {
      this.$refs.upload.submit()
    },
    handleImportJson() {
      this.importJsonVisible = true
    },
    async uploadFileMethod(param) {
      this.jsonDict = await this.getDictFromFile(param.file)
      this.jsonDict.name = this.compositionForm.name
      var composition_id_temp = this.compositionForm.id

      var msg = this.$message({
        duration: 0,
        showClose: false,
        message: 'Parse json'
      })
      getCompositionInfo(this.jsonDict).then(response => {
        this.compositionForm = deepCopy(response)
        this.compositionForm.id = composition_id_temp
      }).then(() => {
        msg.close()
        this.updateActivities()
        this.updateState()
        this.importJsonVisible = false
        this.$refs.upload.clearFiles()
        this.fileList = []
      }).catch(
        error => {
          msg.close()
          msg = this.$message({
            showClose: true,
            message: error,
            type: 'Error'
          })
        }
      )
    },
    compositionFormSimple() {
      var activities = []
      for (var i = 0; i < this.compositionForm.activities.length; i++) {
        var companyOps = []
        for (var companyOp of this.compositionForm.activities[i].companyOps) {
          companyOps.push({
            operation: companyOp.operation,
            ts_code: companyOp.ts_code,
            share: companyOp.share,
            price: companyOp.price
          })
        }
        activities.push({
          companyOps: companyOps,
          timestamp: this.compositionForm.activities[i].timestamp,
          freecash_cur: this.compositionForm.activities[i].freecash_cur
        })
      }
      return {
        id: this.compositionForm.id == null ? undefined : this.compositionForm.id,
        name: this.compositionForm.name,
        description: this.compositionForm.description == null ? undefined : this.compositionForm.description,

        allfund: this.compositionForm.allfund,
        commission: this.compositionForm.commission,
        activities: activities
      }
    },
    async getDictFromFile(jsonFile) {
      return new Promise((resolve, reject) => {
        var reader = new FileReader()
        reader.readAsText(jsonFile, 'utf-8')
        reader.onload = function() {
          resolve(JSON.parse(this.result))
        }
      })
    },
    handleExportJson() {
      const fileURL = window.URL.createObjectURL(new Blob([JSON.stringify(this.compositionFormSimple(), null, 4)]))
      const fileLink = document.createElement('a')
      fileLink.href = fileURL
      fileLink.setAttribute('download', this.compositionForm.name + '.json')
      document.body.appendChild(fileLink)
      fileLink.click()
      document.body.removeChild(fileLink)
    },
    handleDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = this.csvDataListColumns
        const filterVal = this.csvDataListColumns
        const data = this.formatJson(filterVal, this.csvDataList)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: this.compositionForm.name,
          autoWidth: true,
          bookType: 'csv'
        })
        this.downloadLoading = false
      })
    },
    formatJson(filterVal, jsonData) {
      return jsonData.map(v => filterVal.map(j => {
        if (j === 'trade_date') {
          return formatDate(Date(Number(v[j])), 'yyyy-MM-dd')
        } else {
          return v[j]
        }
      }))
    },
    addBenchmarkData(reset = false, addBenchmark = false) {
      var list = []
      if (reset) {
        this.lineChartData.ts_code_list.splice(1, 1, '')
        this.lineChartData.name_list.splice(1, 1, '')
        this.lineChartData.close_data.splice(1, 1, [])
      } else {
        var i = 0
        var j = 0
        while (i < this.lineChartData.time_line.length) {
          if (j >= this.benchmarkForm.hist_data.length) {
            break
          } else if (this.lineChartData.time_line[i] === this.benchmarkForm.hist_data[j][0]) {
            list.push(this.benchmarkForm.hist_data[j][2])
            i++
            j++
          } else if (this.lineChartData.time_line[i] < this.benchmarkForm.hist_data[j][0]) {
            i++
          } else {
            list.push('')
            j++
          }
        }
        if (addBenchmark) {
          this.benchmarkForm = {
            ts_code: undefined,
            name: undefined,
            type: 'index',
            hist_data: []
          }
          this.lineChartData.ts_code_list.splice(1, 0, this.benchmarkForm.ts_code)
          this.lineChartData.name_list.splice(1, 0, this.benchmarkForm.name)
          this.lineChartData.close_data.splice(1, 0, list)
        } else {
          this.lineChartData.ts_code_list.splice(1, 1, this.benchmarkForm.ts_code)
          this.lineChartData.name_list.splice(1, 1, this.benchmarkForm.name)
          this.lineChartData.close_data.splice(1, 1, list)
        }
      }

      setTimeout(() => {
        if (this.whichChart === 'StackLinePieChart') {
          this.$refs.StackLinePieChart.draw(this.lineChartData)
        } else if (this.whichChart === 'StackLineChart') {
          this.$refs.StackLineChart.draw(this.lineChartData)
        }
      }, 0)
    },
    drawCharts() {
      if (this.benchmarkForm.ts_code) {
        if (this.benchmarkForm.type === 'index') {
          var param = { start: this.lineChartData.time_line[0] }
          getIndexHistData(this.benchmarkForm.ts_code, param).then(response => {
            this.benchmarkForm.name = response.name
            this.benchmarkForm.hist_data = response.hist_data
            this.addBenchmarkData(false, false)
          })
        }
      }
    },
    queryIndexSearchAsync(queryString, cb) {
      queryIndexes({ q: queryString }).then(response => {
        var list = []
        for (const item of response.results) {
          list.push({
            value: item.ts_code + ' - ' + item.name,
            ts_code: item.ts_code,
            name: item.name
          })
        }
        cb(list)
      })
    },
    handleIndexSelect(event) {
      this.benchmarkForm.ts_code = event.ts_code
      this.benchmarkForm.name = event.name
      this.drawCharts()
    },
    handleIndexClear(event) {
      this.benchmarkForm.ts_code = undefined
      this.benchmarkForm.name = undefined
      this.addBenchmarkData(true, false)
    },
    handleIndexInput(event) {
      if (event === '') {
        this.handleIndexClear()
      }
    }
  }
}
</script>

<style scoped>
  .tab-container {
    margin: 20px;
  }
  .el-timeline-item .destroy {
    display: none;
    position: absolute;
    right: 20px;
    bottom: -5px;
    margin: auto 0;
    font-size: 25px;
    color: #F44336;
    transition: color 0.2s ease-out;
    cursor: pointer;
  }
  .el-timeline-item .destroy:hover {
    color: #FFFFFF;
    background-color: #F44336;
  }
  .el-timeline-item .destroy:after {
    content: '';
  }
  .el-timeline-item:hover .destroy {
    display: block;
  }
  .el-timeline-item .edit {
    display: none;
    position: absolute;
    right: 50px;
    bottom: -5px;
    margin: auto 0;
    font-size: 25px;
    color: #2196F3;
    transition: color 0.2s ease-out;
    cursor: pointer;
  }
  .el-timeline-item .edit:hover {
    color: #FFFFFF;
    background-color: #2196F3;
  }
  .el-timeline-item .edit:after {
    content: '';
  }
  .el-timeline-item:hover .edit {
    display: block;
  }
  .add {
    display: block;
    margin-left: 35px;
    /*margin: auto 0;*/
    font-size: 25px;
    color: #4CAF50;
    transition: color 0.2s ease-out;
    cursor: pointer;
  }
  .add:hover {
    color: #388E3C;
  }
  .add:after {
    content: '';
  }
  .edit_dialog {
    height: 60vh;
    overflow: auto;
  }
  .sortable-ghost{
    opacity: .8;
    color: #fff!important;
    background: #42b983!important;
  }
  .drag-handler{
    width: 20px;
    height: 20px;
    cursor: pointer;
  }
  .el-row {
    padding: 2px;
  }
  .el-col {
    padding: 2px;
  }
  .card-panel {
    cursor: pointer;
    font-size: 14px;
    position: relative;
    overflow: hidden;
    color: #666;
    box-shadow: 4px 4px 40px rgba(0, 0, 0, .05);
    margin: 3px;
    border:1px solid #dddddd;
    border-radius:6px;
  }
  .timeline-panel {
    height: 540px;
    overflow: auto;
    border:1px solid #dddddd;
    border-radius:10px;
    padding-top: 10px;
  }
</style>
