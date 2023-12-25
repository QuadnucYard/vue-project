import Message from "@/utils/message";

import api from "./request";

export interface questions {
  propose_time: string;
  proposer_name: string;
  proposer_phone_number: string;
  question_id: string;
  question_images: string;
  question_status: null | String;
  question_texts: string;
  reply_images: string;
  reply_texts: string;
}

export interface question_submit {
  propose_time: string;
  proposer_name: string;
  proposer_phone_number: string;
  question_images: string;
  question_texts: string;
}

export interface question_reply {
  reply_images: string;
  reply_texts: string;
}

export async function submitQuestion(
  submit_time: string,
  submit_name: string,
  submit_phone: string,
  submit_img: string,
  submit_text: string
) {
  Message.info("正在提交……");
  const questionbody: question_submit = {
    propose_time: submit_time,
    proposer_name: submit_name,
    proposer_phone_number: submit_phone,
    question_images: submit_img,
    question_texts: submit_text,
  };
  return (await api.post("question/insertQuestion", questionbody)).data;
}

export interface questionRes {}

export async function getQuestion(user_name: string) {
  return (
    await api.get("question/selectQuestionList", {
      params: {
        beginTime: "",
        endTime: "",
        propose_time: "",
        proposer_name: user_name,
        proposer_phone_number: "",
        question_status: "",
      },
    })
  ).data; //
}
