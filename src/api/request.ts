import axios, { AxiosError } from "axios";

import Message from "@/utils/message";
import { redirectLogin } from "@/router";
import { useUserStore } from "@/stores/user";

function format422(data: any, detail: { loc: string[]; msg: string; type: string }[]) {
  return detail.map((t) => t.msg + ".").join(" ");
}

// 创建axios实例
const service = axios.create({
  baseURL: "/api",
  timeout: 10000, // 请求超时时间
  withCredentials: true,
});

// request拦截器
service.interceptors.request.use(
  (config) => {
    const userStore = useUserStore();
    if (userStore.token) {
      config.headers["token"] = userStore.token; // 让每个请求携带自定义token
    }
    // config.headers["Content-Type"] = "application/json";
    return config;
  },
  (error) => {
    // Do something with request error
    console.log(error); // for debug
    Promise.reject(error);
  }
);

// response 拦截器
service.interceptors.response.use(
  (response) => {
    const code = response.status;
    const responseBody = response.data; // 获取响应体
    console.log(responseBody); // 在控制台输出响应体
    if (code < 200 || code > 300) {
      return Promise.reject("error");
    } else {
      // if (responseBody.msg) Message.success(responseBody.msg)
      return response;
    }
  },
  (error: AxiosError<any>) => {
    console.log(error);
    const code = error.response?.status;
    if (error.toString().includes("Error: timeout")) {
      Message.error("网络请求超时");
      return Promise.reject(error);
    }
    if (!code) {
      Message.error("接口请求失败");
      return Promise.reject(error);
    }
    if (code === 400) {
      Message.error(error.response?.data.detail ?? error.message);
    } else if (code === 401) {
      console.log("401 Unauthorized");
      // location.reload();
      Message.error(error.message);
    } else if (code === 403) {
      redirectLogin();
      Message.error(error.response?.data.detail);
    } else if (code == 422) {
      // Unprocessable Entity
      Message.error(format422(JSON.parse(error.config?.data), error.response!.data.detail));
    } else {
      const errorMsg = error.response?.data.msg ?? error.response?.data.detail;
      Message.error(errorMsg ?? "Unknown error");
    }
    return Promise.reject(error);
  }
);

export default service;
