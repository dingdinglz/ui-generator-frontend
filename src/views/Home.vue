<template>
  <div style="margin: 10px">
    <div class="flex flex-col">
      <div class="w-full max-w-8xl mx-auto">
        <div class="rounded-lg border bg-white dark:bg-gray-800 shadow-sm">
          <div class="flex items-center p-3 border-b border-gray-200 dark:border-gray-700 relative">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                 stroke="#a855f7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2">
              <path
                  d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path>
              <path d="M5 3v4"></path>
              <path d="M19 17v4"></path>
              <path d="M3 5h4"></path>
              <path d="M17 19h4"></path>
            </svg>
            <h3 class="text-sm font-medium text-gray-900 dark:text-gray-100">AI 生成</h3>
            <button
                class="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full bg-gray-100 hover:bg-blue-100 text-gray-400 hover:text-blue-500 transition"
                title="帮助"
                @click="introduce"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"/>
                <path d="M9.09 9a3 3 0 1 1 5.83 1c0 2-3 3-3 3"/>
                <circle cx="12" cy="17" r="1"/>
              </svg>
            </button>
          </div>
          <div class="p-4">
        <textarea
            id="prompt-input"
            placeholder="输入您的Idea！让我们帮助你让创意和想法跃然纸上！"
            class="w-full min-h-[100px] resize-none border-0 focus:outline-none focus:ring-0 p-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            v-model="ideaText"
        ></textarea>
            <div class="flex justify-between items-center mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
              <div class="text-xs text-gray-500 dark:text-gray-400">输入清晰的提示以获得最佳结果</div>
              <div class="flex items-center gap-2">
                <select
                    class="px-3 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                    v-model="generateMode"
                >
                  <option value="web">Web端</option>
                  <option value="mobile">手机端</option>
                </select>
                <button
                    class="inline-flex items-center px-3 py-2 text-sm font-medium text-white rounded-md gradient-button"
                    @click="generator"
                    v-loading="startMode"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                       stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                       class="mr-2">
                    <path d="m22 2-7 20-4-9-9-4Z"></path>
                    <path d="M22 2 11 13"></path>
                  </svg>
                  生成
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <br/>
  <el-row>
    <el-col :span="6">
      <div class="w-full max-w-md mx-auto bg-white rounded-xl shadow p-6 relative">
        <button
            class="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-blue-100 text-gray-400 hover:text-blue-500 transition"
            title="帮助"
            @click="introduceTaskList"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10"/>
            <path d="M9.09 9a3 3 0 1 1 5.83 1c0 2-3 3-3 3"/>
            <circle cx="12" cy="17" r="1"/>
          </svg>
        </button>
        <h2 class="text-lg font-bold mb-4">任务列表</h2>
        <ul id="task-list" class="space-y-3">
          <li class="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2" v-for="item in tasks">
            <div class="flex items-center gap-2">
              <span :class="'inline-block w-4 h-4 rounded-full ' + getStatusColor(item)"></span>
              <span class="text-gray-800" @click="selectFile(item.name)">{{ item.name }}</span>
              <span class="text-xs text-gray-400 ml-2">{{ getStatusText(item) }}</span>
            </div>
          </li>
        </ul>
      </div>
    </el-col>
    <el-col :span="18">
      <div id="editor" style="width: 100%; height: 100%">
      </div>
    </el-col>
  </el-row>
  <br/>
  <div style="text-align: right">
    <el-button type="primary" size="large" @click="preview" :disabled="sessionID === ''">预览</el-button>
  </div>
</template>
<script>
import {ElMessage, ElMessageBox} from "element-plus";

let editor, m = "";
import loader from "@monaco-editor/loader";
import axios from "axios";

export default {
  data() {
    return {
      generateMode: "web",
      tasks: [],
      ideaText: "",
      startMode: false,
      sessionID: "",
    }
  },
  methods: {
    getStatusColor(task) {
      return task.status === 2 ? 'bg-green-400' : (task.status === 1 ? 'bg-yellow-400 animate-pulse' : 'bg-gray-300');
    },
    getStatusText(task) {
      return task.status === 2 ? '已完成' : (task.status === 1 ? '进行中' : '未完成');
    },
    addTask(name) {
      const id = this.tasks.length + 1
      const newTask = {
        id: id,
        name: name,
        status: 0
      };
      this.tasks.push(newTask);
      return id
    },
    toggleTaskStatus(id) {
      this.tasks = this.tasks.map(task => {
        if (task.id === id) {
          return {...task, status: (task.status + 1) % 3};
        }
        return task;
      });
    },
    async generator() {
      if (this.startMode) {
        ElMessage.info("正在生成中，请勿重复启动！")
        return
      }
      ElMessage.success("开始生成！请耐心等待任务列表出现或者报错提示！")
      const that = this
      this.startMode = true
      const eventSource = new EventSource("/api/generate?idea=" + encodeURIComponent(this.ideaText) + "&mode=" + this.generateMode)
      eventSource.onmessage = async function (event) {
        var messageJSON = JSON.parse(event.data)
        if (messageJSON.type === "error") {
          ElMessage.error(messageJSON.message)
          eventSource.close();
          setTimeout(function () {
            window.location.reload()
          }, 3000)
          return
        }
        if (messageJSON.type === "start") {
          that.sessionID = messageJSON.message
          return
        }
        if (messageJSON.type === "update") {
          if (m === "") {
            return;
          }
          const model = m.editor.createModel(messageJSON.message, "html")
          editor.setModel(model)
          editor.revealLine(model.getLineCount())
          return
        }
        if (messageJSON.type === "task") {
          var taskJSON = JSON.parse(messageJSON.message)
          taskJSON.data.forEach(data => {
            that.addTask(data.name)
          })
          if (m === "") {
            return
          }
          await loader.init()
              .then(monaco => {
                m = monaco
                editor = monaco.editor.create(document.getElementById("editor"), {
                  value: "",
                  language: "html",
                  fontSize: 25,
                  theme: "vs-dark",
                })
              })
          return
        }
        if (messageJSON.type === "task_start" || messageJSON.type === "task_end") {
          that.tasks.forEach(task => {
            if (task.name === messageJSON.message) {
              that.toggleTaskStatus(task.id)
            }
          })
          return
        }
        if (messageJSON.type === "end") {
          eventSource.close();
          that.startMode = false
          ElMessage.success("生成完毕！")
        }
      }
    },
    preview() {
      if (this.sessionID === "") {
        ElMessage.info("预览界面暂未生成")
        return
      }
      window.open("/" + this.sessionID + "/")
    },
    selectFile(name) {
      axios.get("/api/file?id=" + encodeURIComponent(this.sessionID) + "&name=" + encodeURIComponent(name))
          .then(res => {
            if (m === "") {
              return
            }
            const model = m.editor.createModel(res.data, "html")
            editor.setModel(model)
          })
    },
    introduce() {
      ElMessageBox.alert("这是一个让你的想法<strong>快速成型</strong>的应用，得益于llm的发展，我们甚至可以让ui出现在开发之前<br>你可以用来验证idea可行性，甚至直接将源码用于开发中", "UI-Generator", {
        confirmButtonText: '好的！',
        dangerouslyUseHTMLString: true
      })
    },
    introduceTaskList() {
      ElMessageBox.alert("<strong>生成过程中</strong>，任务列表为您实时展示生成状态<br><strong>生成结束后</strong>，你可以通过点击任务列表中的文件名将右侧的编辑器切换到对应的文件<br><strong>编辑器编辑完文件后</strong>，点击下方的保存可以保存该文件", "任务列表如何用", {
        confirmButtonText: '好的！',
        dangerouslyUseHTMLString: true
      })
    }
  }
}
</script>
<style>
.gradient-button {
  background: linear-gradient(to right, #a855f7, #6366f1);
}

.gradient-button:hover {
  background: linear-gradient(to right, #9333ea, #4f46e5);
}
</style>