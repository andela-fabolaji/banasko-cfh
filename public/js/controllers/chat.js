'use strict';

angular.module('mean.system')
  .controller('ChatCtrl', ['$scope', 'game', '$sce',
    function ($scope, game, $sce) {
      $scope.chats = game.cfhChat;
      $scope.chatWindow = false;
      $scope.form = {};


      /** 
       * Checks if chat message is from the user.
       * @param{String} username of the user
       */
      $scope.isUser = (username) => {
        return $scope.chats.username === username;
      };

      /** 
       * Sends a new message.
       * @param{String} message to send
       */
      function send (message) {
        $scope.chats.postMessage(message);
        scrollChats();
      }

      /** 
       * Converts text to html
       * @param{String} message text to convert
       */
      $scope.parser = (message) => {
        return $sce.trustAsHtml(message);
      };

      /** 
       * Show and hide chat.
       */
      function showChat() {
        $(document).ready(function () {
          $('.chat-head').on('click', () => {
            $('#main-chat').toggle();
          });
        });
      }

      /** 
       * Scrolls chat to bottom.
       */
      function scrollChats () {
        const element = document.getElementById('chat-body');
        if (element) {
          setTimeout(function () {
            element.scrollTop = element.scrollHeight;
          }, 100);
        }
      }

      /** 
       * initialize emoji
       */
      function emoji() {
        $(document).ready(function () {
          $("#chat-form").emojioneArea({
            events: {
              /**
               * @param {jQuery} editor EmojioneArea input
               * @param {Event} event jQuery Event object
               */
              keydown: function (editor, event) {
                const message = editor.context.innerHTML;
                if (event.which === 13 && message.length > 1) {
                  send(message.trim());
                  editor.context.innerHTML = '';
                  scrollChats();
                }
              }
            }
          });
        });
      }
      scrollChats();
      showChat();
      emoji();
    }
  ]);