import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    userRole: '普通员工', // 默认角色
    permissions: {
      '普通员工': ['attendance', 'leave', 'salary', 'reward', 'report'],
      '部门经理': ['review_attendance', 'review_leave'],
      '文员': ['full_access'],
      '管理员': ['admin']
    }
  },
  getters: {
    allowedModules: (state) => {
      return state.permissions[state.userRole] || []
    }
  },
  mutations: {
    setUserRole(state, role) {
      state.userRole = role
    }
  },
  actions: {
    updateRole({ commit }, role) {
      commit('setUserRole', role)
    }
  }
})