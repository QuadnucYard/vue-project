<template>
  <div class="chart-container">
    <div>
      <el-form-item label="日期">
        <el-date-picker
          v-model="time_form.time_select"
          type="date"
          placeholder="选择日期"
          :disabled-date="disabledDate"
        ></el-date-picker>
      </el-form-item>
    </div>
    <div class="chart">
      <Gante2 :timett="time_form.time_select" />
    </div>
  </div>

  <!-- <div>
    <timeset />
  </div> -->
  <div>
    <h5>会议室预约</h5>
    <el-form :model="bookingForm" label-width="120px">
      <div class="flex">
        <el-form-item label="会议室">
          <el-select v-model="bookingForm.room" placeholder="选择会议室">
            <el-option v-for="room in rooms" :value="room.available_type_name + room.available_id"> </el-option>
          </el-select>
        </el-form-item>
        <el-button size="small" class="text-bu" type="primary" :icon="search" @click="dialog_switch = true"
          >详细信息</el-button
        >
      </div>
      <el-form-item label="日期">
        <el-date-picker v-model="bookingForm.date" type="date" placeholder="选择日期"></el-date-picker>
      </el-form-item>
      <el-form-item label="时间">
        <!-- <el-time-picker v-model="bookingForm.time" placeholder="选择时间段"></el-time-picker> -->
        <div>
          <timeset ref="timeset" />
        </div>
      </el-form-item>
      <el-form-item label="手机号">
        <el-input v-model="bookingForm.booker" placeholder="请输入手机号"></el-input>
      </el-form-item>
      <el-form-item label="会议主题">
        <el-input v-model="bookingForm.theme" placeholder="请输入会议主题"></el-input>
      </el-form-item>
      <el-form-item label="备注">
        <el-input type="textarea" v-model="bookingForm.remark" placeholder="请输入备注"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button @click="submitBooking">提交预约</el-button>
        <el-button @click="resetForm">重置</el-button>
      </el-form-item>
    </el-form>
  </div>

  <div>
    <el-drawer v-model="dialog_switch" title="I am the title" :with-header="false">
      <span>健雄书院会议室</span>
      <div>
        <el-tabs v-model="activeName" type="card" class="demo-tabs" @tab-click="handleClick">
          <el-tab-pane v-for="room in rooms" :key="room.available_id" :label="room.available_name">
            <p>{{ "会议室名称：" + room.available_name }}</p>
            <p>{{ "会议室当前状态:" + room.available_status }}</p>
            <p>{{ "会议室信息:" + room.available_description }}</p>
            <p>{{ "图片:" + room.available_image }}</p>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-drawer>
  </div>
</template>

<script lang="ts">
import { Delete, Edit, Search, Share, Upload } from "@element-plus/icons-vue";
import type { TabsPaneContext } from "element-plus";

import { getAppoint_by_day, get_all, get_roomset, submitAppoint, update_img } from "@/api/meeting_gante";
import { getUserMe } from "@/api/user";
import { useUserStore } from "@/stores/user";
import Message from "@/utils/message";
import Gante2 from "@/views/chart/gante2.vue";
import table1 from "@/views/chart/table1.vue";
import table2 from "@/views/chart/table2.vue";
import timeset from "@/views/room/time.vue";
import tabletest from "@/views/tabulation/tabletest.vue";

interface room {
  available_description: string;
  available_id: number;
  available_image: string;
  available_name: string;
  available_status: string;
  available_type_name: string;
}

const activeName = ref("first");
const dialog_switch = ref(false);

export default {
  components: { tabletest, table2, table1, timeset, Gante2 },

  async mounted() {
    //const appoint = await getAppoint_by_day("2023-12-20", "SUBMITTED");
    const updateImg = await update_img(1, "123");
    const all = await get_all();
    console.log(updateImg, all);
    this.room_template();
  },

  data() {
    let rooms: room[] = [];
    return {
      bookingForm: {
        room: "",
        date: "",
        booker: "",
        theme: "",
        remark: "",
      },
      time_form: {
        time_select: "",
      },
      search: Search,
      rooms,
      dialog_switch,
      activeName: "First",
      pos: "top",
      disabledDate(time: { getTime: () => number }) {
        //return time.getTime() > Date.now();
        const currentDate = new Date();
        const upperBound = new Date().setDate(currentDate.getDate() + 6);
        //禁止选择今天以前的时间和7天后的时间
        return time.getTime() < Date.now() - 8.64e7 || time.getTime() > upperBound;
      },
    };
  },

  methods: {
    async submitBooking() {
      if (
        this.bookingForm.room === "" ||
        this.bookingForm.date === "" ||
        this.bookingForm.booker === "" ||
        this.bookingForm.theme === "" ||
        this.$refs.timeset.startTime === "" ||
        this.$refs.timeset.endTime === ""
      ) {
        alert("请填写所有必填项");
        return;
      }

      Message.info("正在提交预约信息");
      const date_ = new Date(this.bookingForm.date);
      const start_ = this.formatTimestamp(this.getTimeFormat(this.$refs.timeset.startTime, date_));
      const end_ = this.formatTimestamp(this.getTimeFormat(this.$refs.timeset.endTime, date_));
      const temp = new Date();
      const submit = this.formatTimestamp(temp.getTime());
      const des = this.bookingForm.theme;
      const temp_str = this.bookingForm.room;
      const avail_id = parseInt(temp_str[temp_str.length - 1], 10);
      const avail_type_name = "会议室";
      const avail_name = temp_str[temp_str.length - 1] + "号" + avail_type_name;
      const user = useUserStore().user!;
      const user_id = user.user_id;
      const user_name = user.user_name;
      const phone = this.bookingForm.booker;
      const submit_info = await submitAppoint(
        start_,
        end_,
        des,
        avail_id,
        avail_name,
        avail_type_name,
        user_id,
        user_name,
        phone
      );
      console.log(
        "预约信息:",
        date_,
        start_,
        end_,
        submit,
        des,
        avail_id,
        avail_type_name,
        avail_name,
        user_id,
        user_name,
        phone,
        user
      );
    },

    async room_template() {
      try {
        const roomdata = (await get_roomset("会议室")).data;
        this.rooms = roomdata;
        //console.log("room:",roomdata);
      } catch (error) {
        console.error(error);
      }
    },

    resetForm() {
      this.bookingForm = {
        room: "",
        date: "",
        booker: "",
        theme: "",
        remark: "",
      };
      this.time_form = {
        time_select: "",
      };

      this.$refs.timeset.reset();
    },

    getdate() {
      return this.time_form.time_select;
    },

    getTimeFormat(time: string, date: Date) {
      const [hours, minutes] = time.split(":");
      date.setHours(parseInt(hours, 10));
      date.setMinutes(parseInt(minutes, 10));
      return date.getTime();
    },

    formatTimestamp(timestamp: number) {
      const date = new Date(timestamp);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");

      const formattedDateTime = `${year}-${month}-${day} ${hours}:${minutes}`;
      return formattedDateTime;
    },

    handleClick(tab: TabsPaneContext, event: Event) {
      console.log(tab, event);
    },
  },
};
</script>

<style>
.chart {
  width: 100%;
  flex: 1;
  background-color: #ffffff;
}

.chart-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  /*height: calc(100% - 30px);*/
  height: 66vh;
  background-color: #ffffff;
  margin-bottom: 40px;
  margin-top: 40px;
}

.text-bu {
  margin-top: 3px;
  margin-left: 10px;
}

.demo-tabs > .el-tabs__content {
  padding: 10px;
  /* color: #6b778c; */
  font-size: 24px;
  font-weight: 600;
}
</style>
