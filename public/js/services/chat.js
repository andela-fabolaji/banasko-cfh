'use strict';

angular.module('mean.system')
  .constant('FIRE_BASE_URL', 'https://cfh-group-chat.firebaseio.com')
  .factory('Chat', ['FIRE_BASE_URL', function (FIRE_BASE_URL) {

    /** 
     * ChatService class
     *  @class
     */
    class ChatService {

      /** 
       * Chat service constructor.
       *  @constructor
       */
      constructor() {
        this.db = new Firebase(FIRE_BASE_URL);
        this.messages = [];
      }

      /** 
       * Creates a new chat.
       * @params {String}
       */
      createChat() {
        this.chat = this.db.set(this.gameId);
        this.messages = [];
      }

      /** 
       * Deletes a chat
       * @void 
       */
      deleteChat() {
        this.db.child(this.gameId).remove();
      }


      /** 
       * Sets game id.
       * @params {String}
       */
      setGameId(id) {
        this.gameId = id;
      }

      /** 
       *  Sets current username.
       *  @params {String} username of user 
       */
      setUsername(username) {
        this.username = username;
      }

      /** 
       * listens for incoming messages.
       * @void {String}
       */
      checkForMessages() {
        this.db.child(this.gameId).off();
        this.db.child(this.gameId).on('child_added', (snap) => {
          this.messages.push(snap.val());
        });
      }

      /** 
       * Creates a new message.
       * @void {String}
       */
      postMessage(message) {
        const date = new Date();
        const details = {
          'avatar': this.avatar,
          'date': date,
          'username': this.username,
          'message': message
        };
        this.db.child(this.gameId).push(details);
      }

      /** 
       * Sets user avatar.
       * @void
       */
      setAvatar(avatar) {
        this.avatar = avatar;
      }
    }
    
    //instantiating a new ChatService
    const chat = new ChatService();
    return chat;
  }]);