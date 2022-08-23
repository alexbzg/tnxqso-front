<template>
    <div id="users">
      <div id="users_menu">
        <span
            v-for="filter in $options.FILTERS"
            :class="{active: active_filter == filter.id}"
            @click="loadUsers(filter.id)"
            :key="filter.id"
            >
            {{filter.title}}
        </span>
      </div>

      <table>
        <tr>
          <th>Verified</th>
          <th>Login</th>
          <th>Email</th>
          <th>Chat callsign</th>
          <th>Chat name</th>
          <th>Banned</th>
        </tr>
        <tr
          v-for="user in users"
          :key="user.callsign"
          >
          <td class="checkbox">
            <input
                type="checkbox"
                v-model="user.verified"
                @change="editUser(user)"
                />
          </td>
          <td>{{user.callsign}}</td>
          <td>
            <input
                type="checkbox"
                v-model="user.email_confirmed"
                @change="editUser(user)"
                />
            {{user.email}}
          </td>
          <td>{{user.chat_callsign}}</td>
          <td>{{user.name}}</td>
          <td class="checkbox">
            <input
                type="checkbox"
                v-model="user.banned"
                @change="banUser(user)"
                />
          </td>
        </tr>
      </table>


    </div>
</template>

<script>
import {mapActions} from 'vuex'

import {ACTION_POST} from '../store-user'

const FILTERS = [
  {id: 'new', title: 'New'},
  {id: '', title: 'All users'},
  {id: 'no_chatcall', title: 'No ChatCall'},
  {id: 'banned', title: 'Banned'}
  ]

export default {
  FILTERS: FILTERS,
  name: 'users',
  beforeRouteEnter ( to, from, next ) {
    next(vm => {
      if (!vm.$store.getters.siteAdmin) {
        vm.$router.push('/login')
      }
    })
  },
  data () {
    return {
      users: [],
      pending: false,
      active_filter: 'new'
    }
  },
  mounted () {
    this.loadUsers('new')
  },
  methods: {
    ...mapActions([ACTION_POST]),
    loadUsers (filter) {
      this.pending = true
      this[ACTION_POST]({
        path: 'users',
        data: {filter: filter}
      })
        .then(rsp => {
          this.users = rsp.data
          this.active_filter = filter
        })
        .finally(() => {
          this.pending = false
        })
    },
    editUser (user) {
      this.pending = true
      this[ACTION_POST]({
        path: 'editUser',
        data: {
          'callsign': user.callsign,
          'verified': user.verified,
          'email_confirmed': user.email_confirmed
        }
      })
        .finally(() => {
          this.pending = false
        })
    },
    banUser (user) {
      this.pending = true
      this[ACTION_POST]({
        path: 'banUser',
        data: {
          user: user.callsign,
          unban: !user.banned
        }
      })
        .finally(() => {
          this.pending = false
        })
    }
  }
}

</script>

<style scoped>
</style>
