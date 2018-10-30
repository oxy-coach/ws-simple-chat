
<template>
  <div class="card mt-3">
      <div class="card-body" v-bind:class="{ hidden: isGuest }">
          <div class="card-title">
              <h3>Добро пожаловать в чат, {{ nickname }} !</h3>
          </div>
          <div class="card-messages">
              <div class="messages" v-for="(msg, index) in messages" :key="index">
                  <p v-if="msg.isSystem">
                      <span class="system-msg">{{ msg.message }}</span> 
                  </p>
                  <p v-else>
                      <span class="font-weight-bold" v-bind:style="{ color: msg.user.color }">{{ msg.user.name }}: </span>
                      {{ msg.message }}
                  </p>
              </div>
          </div>
          <div class="card-footer">
            <form @submit.prevent="sendMessage">
                <div class="form-group pb-3">
                    <input type="text" v-model="message" class="form-control" autofocus>
                </div>
                <button type="submit" class="btn btn-success">Отправить</button>
            </form>
          </div>
          <div class="card-users">
              <span class="users-count">Пользователей в чате: </span><span class="font-weight-bold">{{ usersCount }}</span>
              <hr>
              <div class="users-list">
                  <div class="user-name" v-for="(user, index) in usersList" :key="index">
                      <p>
                          <span class="font-weight-bold" :style="{color: user.color}">{{ user.name }}</span>
                      </p>
                  </div>
              </div>
          </div>
      </div>
      
      <div class="card-login" v-bind:class="{ active: isGuest }">
          <form @submit.prevent="login">
              <div class="form-group">
                  <label for="nickname">Введите свой ник</label>
                  <input type="text" v-model="nickname" class="form-control" required autofocus pattern="^[A-Za-zА-Яа-яЁё\s\-_0-9]{2,30}$">
              </div>
              <button type="submit" class="btn btn-success">Подтвердить</button>
          </form>
      </div>
  </div>
</template>

<script>
import io from 'socket.io-client';

export default {
    data() {
        return {
            isGuest: true,
            nickname: '',
            message: '',
            messages: [],
            usersList: [],
            socket : io('localhost:3001')
        }
    },
    methods: {
        sendMessage(e) {
            e.preventDefault();
            
            this.socket.emit('chat message', this.message);
            this.message = ''
        },
        login(e) {
            e.preventDefault();
            this.socket.emit('login', this.nickname, (data) => {
                this.isGuest = false;
            });
        },
        displayInfo(info) {

        }
    },
    computed: {
        usersCount: function () {
            let count = 0;
            for (let item in this.usersList) {
                count++;
            }
            return count;
        }
    },
    mounted() {
        this.socket.on('message', (data) => {
            this.messages = [...this.messages, data];
            // you can also do this.messages.push(data)
        });
        this.socket.on('users list', (data) => {
          this.usersList = data;
        });
        this.socket.on('new user', (data) => {
          this.messages = [...this.messages, {
              isSystem: true,
              message: 'Пользователь "' + data.user.name + '" зашел в чат'
          }];
        });
        this.socket.on('user left', (data) => {
            console.log(data);
            this.messages = [...this.messages, {
              isSystem: true,
              message: 'Пользователь "' + data.user.name + '" покинул чат'
          }];
        });
    }
}
</script>

<style lang="scss">

</style>