export const PLAYER_STATUSES = {
	ONLINE: "Online",
	IN_GAME: "In Game"
};
  
export const DOM = {
	profile: {
	  modal: document.getElementById("profileModal"),
	  closeBtn: document.querySelector(".close-profile-modal"),
	  avatar: document.getElementById("profileAvatar"),
	  nickname: document.getElementById("profileNickname"),
	  rankIcon: document.getElementById("profileRankIcon"),
	  rankText: document.getElementById("profileRankText"),
	  totalGames: document.getElementById("totalGames"),
	  winRate: document.getElementById("winRate"),
	},
	game: {
	  options: document.querySelectorAll(".gameOption"),
	  modeOptions: document.querySelectorAll(".modeOption"),
	  playButton: document.querySelector(".playHomePage"),
	},
	sections: {
	  avatarSection: document.querySelector(".avatarSection"),
	  rankSection: document.querySelector(".rankSection"),
	},
	onlineGame: {
	  modal: document.querySelector(".online-game-modal"),
	  closeBtn: document.querySelector(".close-online-game"),
	  launchBtn: document.querySelector(".launch-game"),
	  content: document.querySelector(".online-game-sections"),
	  loading: document.querySelector(".game-loading"),
	  friendsList: document.getElementById("friendsList"),
	  playersList: document.getElementById("onlinePlayersList"),
	},
	chat: {
	  messages: document.getElementById("chatMessages"),
	  input: document.getElementById("messageInput"),
	  sendButton: document.getElementById("sendMessage"),
	}
};
