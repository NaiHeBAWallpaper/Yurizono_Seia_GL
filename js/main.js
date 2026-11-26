let canvas, textbox, gl, shader, batcher, assetManager, skeletonRenderer;
let mvp = new spine.Matrix4();

let lastFrameTime;
let initialLoadTimer;
let modelFrame;
let renderFrame;
let renderTimer;
let loadingResolution;
let spineData;

let customScale = 1;
let positionX = 0;
let positionY = 0;
let targetFps = 60;
let bgmfile = './assets/audio/Breaking Silence.ogg';
let bgmvolume = 0;
let bgm;
let bufferColor = [0.3, 0.3, 0.3];

let introAnimation, acceptingClick;
let dialogBox = false;
let currentVoiceline = 1;
let mouseSelect = -1;
let trackerID = -1;
let untrackerID = -1;
let EPointX, EPointY;
let TPoint, TEye;
let headpatOrigin;
let headpatCooldown = 0;
const headpatTarget = new spine.Vector2();
const headpatOffset = new spine.Vector2();
let flipped = false;

let transpose = 1;

let currentTracks = []; // 跟踪当前播放的音频
let interfaceLanguage = 'default';
let steamLanguage = '';
let subtitleLanguagePreference = 'auto';
window.selectedLanguage = 'English';
const subtitleLocales = {
	English: 'en',
	Chinese: 'zh-Hans',
	TraditionalChinese: 'zh-Hant',
	Japanese: 'ja',
	Korean: 'ko'
};

const CHARACTER = 'CH0070';
let modelResolution = '8k';
const HAS_A = { eye: false, point: true };

// Subtitles follow the Talk events in each Spine animation.

const AUDIO_DETAIL = [
	{
		dialog: {
			Japanese: [
				"いらっしゃていたのですね。",
				"そうは見えないかもしれませんが、これでも驚いているのです。"
			],
			English: [
				"I didn't even know you were coming.",
				"You may not see it that way, but seeing it like this is still a surprise."
			],
			Chinese: [
				"您来了。",
				"您可能看不出来，我可是相当惊讶。"
			],
			TraditionalChinese: [
				"您來了。",
				"您可能看不出來，我可是相當驚訝。"
			],
			Korean: [
				"오실 줄 몰랐어요",
				"당신은 그런 식으로 보지 않을 수도 있지만, 이런 식으로 보는 것은 여전히 놀라움입니다."
			]
		}
	},
	{
		dialog: {
			Japanese: [
				"いいえ、悪いことではなく。私にとって驚くというのは、楽しいことなんです。",
				"以前からずっと、望んでいたので。"
			],
			English: [
				"It's not a bad story. It's fun to have so many surprises.",
				"From before… Because it's something I've been hoping for."
			],
			Chinese: [
				"不，这并不是什么坏事。于我而言惊讶，等同于有趣。",
				"惊讶，是我一直渴望的东西。"
			],
			TraditionalChinese: [
				"不，這並不是什麼壞事。於我而言驚訝，等同於有趣。",
				"驚訝，是我一直渴望的東西。"
			],
			Korean: [
				"나쁘지 않은 이야기가 아니죠. 너무 많은 놀라움은 재미있죠.",
				"전까지만 해도... 내가 기대했던 일이었기 때문이죠."
			]
		}
	},
	{
		dialog: {
			Japanese: [
				"それもこうして、",
				"目の前に先生が現れてくださったのは、尚更。"
			],
			English: [
				"And like this,",
				"Especially when a teacher suddenly appears in front of you."
			],
			Chinese: [
				"而且像这样，",
				"老师出现在我眼前，更是望眼欲穿。"
			],
			TraditionalChinese: [
				"而且像這樣，",
				"老師出現在我眼前，更是望眼欲穿。"
			],
			Korean: [
				"그리고 이렇게,",
				"특히 선생님이 갑자기 앞에 나타나면"
			]
		}
	},
	{
		dialog: {
			Japanese: [
				"ええと、今日は…あぁ、そうですね…",
				"私がお願いしたのでしたね。"
			],
			English: [
				"Let me see. Today... Ah, I see.",
				"You came at my request."
			],
			Chinese: [
				"嗯…今天是…啊啊，原来如此…",
				"是我拜托您过来的。"
			],
			TraditionalChinese: [
				"嗯…今天是…啊啊，原來如此…",
				"是我拜託您過來的。"
			],
			Korean: [
				"보여줘 오늘...",
				"내 요청에 따라 왔어"
			]
		}
	},
	{
		dialog: {
			Japanese: [
				"申し訳ありません。特に用事があったわけではなくて…",
				"ただ、",
				"ただ…君と言葉を交わしたい。そう、思っただけです。"
			],
			English: [
				"Sorry. There's nothing special going on.",
				"just...",
				"I just... want to have a conversation with you. I just thought so."
			],
			Chinese: [
				"非常抱歉，其实也不是有什么要紧事…",
				"不过只是，",
				"只是…想和您聊聊天。只是，这样而已。"
			],
			TraditionalChinese: [
				"非常抱歉，其實也不是有什麼要緊事…",
				"不過只是，",
				"只是…想和您聊聊天。只是，這樣而已。"
			],
			Korean: [
				"미안해요 특별한 일이 없어요",
				"그냥...",
				"그냥 얘기하고 싶었어요"
			]
		}
	}
];


const HITBOX = {
	headpat: { xMin: 1650, xMax: 2400, yMin: 170, yMax: 540 },
	voiceline: { xMin: 450, xMax: 1420, yMin: 720, yMax: 1410 }
};

const INTRO_TIMEOUT = 19500;
const HEADPAT_CLAMP = 30;
const HEADPAT_DRAG_SCALE = 0.35;
const HEADPAT_FOLLOW_TIME = 0.055;
const HEADPAT_RETURN_TIME = 0.08;
const EYE_CLAMP_X = 200;
const EYE_CLAMP_Y = EYE_CLAMP_X * (9 / 16);
const EYE_STEP = 10;

let mousePos = { x: 0, y: 0 };
let volume = 0.5;
let mouseOptions = { voicelines: true, headpatting: true, mousetracking: true, drawHitboxes: false };

// Helper clamp function. Math does not appear to have clamp() in this version.
function clamp(num, min, max) {
	return Math.min(Math.max(num, min), max);
}

// NOTE: X and Y appears to be inversely related from cursor position to bone adjustment.
//       This behavior's reason is unknown, but it LOOKS right so leave it alone!
function trackMouse() {
	let adjX = (mousePos.x / canvas.width) - 0.5;
	let adjY = (mousePos.y / canvas.height) - 0.5;
	TEye.y = TEye.y - (Math.sign(adjX) * EYE_STEP);
	TEye.x = TEye.x - (Math.sign(adjY) * EYE_STEP);
	TEye.y = clamp(TEye.y, EPointY - (Math.abs(adjX) * EYE_CLAMP_X), EPointY + (Math.abs(adjX) * EYE_CLAMP_X));
	TEye.x = clamp(TEye.x, EPointX - (Math.abs(adjY) * EYE_CLAMP_Y), EPointX + (Math.abs(adjY) * EYE_CLAMP_Y));
}

function untrackMouse() {
	if (Math.abs(TEye.y - EPointY) <= EYE_STEP && Math.abs(TEye.x - EPointX) <= EYE_STEP) {
		if (untrackerID != -1) {
			TEye.y = EPointY;
			TEye.x = EPointX;
			clearInterval(untrackerID);
			untrackerID = -1;
			setTimeout(function () {
				acceptingClick = true;
			}, 500);
		}
	}
	if (TEye.y > EPointY) TEye.y -= EYE_STEP;
	if (TEye.y < EPointY) TEye.y += EYE_STEP;
	if (TEye.x > EPointX) TEye.x -= EYE_STEP;
	if (TEye.x < EPointX) TEye.x += EYE_STEP;
}

function applyHeadpat(delta) {
	const dx = headpatTarget.x - headpatOffset.x;
	const dy = headpatTarget.y - headpatOffset.y;
	if (Math.abs(dx) < 0.01 && Math.abs(dy) < 0.01) {
		headpatOffset.set(headpatTarget.x, headpatTarget.y);
	} else {
		const blend = 1 - Math.exp(-delta / (headpatOrigin ? HEADPAT_FOLLOW_TIME : HEADPAT_RETURN_TIME));
		headpatOffset.x += dx * blend;
		headpatOffset.y += dy * blend;
	}
	TPoint.x += headpatOffset.x;
	TPoint.y += headpatOffset.y;
}

function releaseHeadpatOnExit() {
	if (headpatOrigin && spineData) releasedMouse();
}

function playVoiceline() {
	const state = spineData.state;
	const animationName = `Talk_0${currentVoiceline}`;
	const { dialog } = AUDIO_DETAIL[currentVoiceline - 1];
	const motion = state.setAnimation(1, `${animationName}_M`, false);
	const expression = state.setAnimation(2, `${animationName}_A`, false);
	state.addEmptyAnimation(1, 0.5, motion.animationEnd);
	state.addEmptyAnimation(2, 0.5, expression.animationEnd);

	const cues = motion.animation.timelines
		.flatMap(timeline => timeline.events || [])
		.filter(event => event.data.name === 'Talk');
	const clips = new Map(cues.map((event, index) => {
		const filename = CHARACTER + event.stringValue.slice(CHARACTER.length).toLowerCase();
		const track = new Audio(`./assets/audio/${filename}.ogg`);
		track.preload = 'auto';
		track.volume = volume;
		return [event, { track, dialog, index }];
	}));

	acceptingClick = false;
	motion.listener = {
		event: (_entry, event) => {
			const clip = clips.get(event);
			if (!clip) return;
			const { track, index } = clip;
			currentTracks.push(clip);
			const finish = () => {
				if (!currentTracks.includes(clip)) return;
				currentTracks = currentTracks.filter(active => active !== clip);
				if (!currentTracks.length) textbox.style.opacity = 0;
			};
			track.addEventListener('ended', finish, { once: true });
			track.play().catch(finish);

			if (dialogBox) {
				textbox.textContent = dialog[window.selectedLanguage][index];
				textbox.style.opacity = 1;
			}
		},
		complete: () => {
			acceptingClick = true;
			currentVoiceline = currentVoiceline % AUDIO_DETAIL.length + 1;
		}
	};
}

// Hitbox Scaling
function t(n, side) {
	let d = { x: { length: 2560, mid: (canvas.width / 2) }, y: { length: 1600, mid: (canvas.height / 2) } }
	n = d[side].mid - n;
	n = (d[side].length / (transpose * 2)) - n;
	n = (n - (d[side].length / (transpose * 2))) / customScale;
	return (n + (d[side].length / (transpose * 2))) * transpose;
}

// -1 = [No Entry], 1 = Headpat, 2 = Voiceline, 3 = Eye Track
function pressedMouse(x, y) {
	tx = t(x, 'x');
	ty = t(y, 'y');
	if (tx > HITBOX.headpat.xMin && tx < HITBOX.headpat.xMax && ty > HITBOX.headpat.yMin && ty < HITBOX.headpat.yMax && mouseOptions.headpatting) {
		spineData.state.setAnimation(1, 'Pat_01_M', false);
		if (HAS_A.point) spineData.state.setAnimation(2, 'Pat_01_A', false);
		headpatOrigin = { x, y };
		mouseSelect = 1;
	}
	else if (tx > HITBOX.voiceline.xMin && tx < HITBOX.voiceline.xMax && ty > HITBOX.voiceline.yMin && ty < HITBOX.voiceline.yMax && mouseOptions.voicelines) {
		mouseSelect = 2;
	}
	else if (mouseOptions.mousetracking) {
		if (trackerID == -1) {
			trackerID = setInterval(trackMouse, 20);
		}
		spineData.state.setEmptyAnimation(1, 0);
		spineData.state.setEmptyAnimation(2, 0);
		let eyetracking = spineData.state.addAnimation(1, 'Look_01_M', false, 0);
		eyetracking.mixDuration = 0.2;
		if (HAS_A.eye) {
			let eyetracking2 = spineData.state.addAnimation(2, 'Look_01_A', false, 0);
			eyetracking2.mixDuration = 0.2;
		}
		mousePos.x = x;
		mousePos.y = y;
		mouseSelect = 3;
	}
	else if (mouseSelect == -1) {
		acceptingClick = true;
	}
}

function drawHitboxes() {
	if (!overlay || !overlay.getContext) return;
	const ctx = overlay.getContext('2d');
	if (!ctx) return;

	ctx.clearRect(0, 0, overlay.width, overlay.height);
	if (!mouseOptions.drawHitboxes) return;

	
	ctx.save();
	ctx.lineWidth = 2;
	ctx.strokeStyle = 'red';
	ctx.globalAlpha = 0.5;

	function worldToScreen(n, side) {
		let d = { x: { length: 2560, mid: (canvas.width / 2) }, y: { length: 1600, mid: (canvas.height / 2) } };
		n = (n / transpose) - (d[side].length / (transpose * 2));
		n = n * customScale + (d[side].length / (transpose * 2));
		n = (d[side].length / (transpose * 2)) - n;
		const offset = side === 'x' ? canvas.width * positionX : canvas.height * positionY;
		return d[side].mid - n + offset;
	}

	for (const key in HITBOX) {
		const box = HITBOX[key];
		const x1 = worldToScreen(box.xMin, 'x');
		const y1 = worldToScreen(box.yMin, 'y');
		const x2 = worldToScreen(box.xMax, 'x');
		const y2 = worldToScreen(box.yMax, 'y');
		const width = x2 - x1;
		const height = y1 - y2;
		ctx.strokeRect(x1, y2, width, height);
	}

	ctx.restore();
}

function movedMouse(x, y) {
	switch (mouseSelect) {
		case 1: {
			const scale = HEADPAT_DRAG_SCALE * transpose / customScale;
			const parent = TPoint.parent;
			headpatTarget.set(
				parent.worldX + (x - headpatOrigin.x) * scale,
				parent.worldY + (headpatOrigin.y - y) * scale
			);
			parent.worldToLocal(headpatTarget);
			const distance = headpatTarget.length();
			if (distance > HEADPAT_CLAMP) {
				headpatTarget.x *= HEADPAT_CLAMP / distance;
				headpatTarget.y *= HEADPAT_CLAMP / distance;
			}
			break;
		}
		case 2:
			mouseSelect = -1;
			acceptingClick = true;
			break;
		case 3:
			mousePos.x = x;
			mousePos.y = y;
			break;
		default:
	}
}

function releasedMouse() {
	switch (mouseSelect) {
		case 1: {
			headpatOrigin = null;
			headpatTarget.set(0, 0);
			const state = spineData.state;
			const motion = state.setAnimation(1, 'PatEnd_01_M', false);
			const expression = state.setAnimation(2, 'PatEnd_01_A', false);
			state.addEmptyAnimation(1, 0.5, motion.animationEnd);
			state.addEmptyAnimation(2, 0.5, expression.animationEnd);
			headpatCooldown = setTimeout(() => {
				headpatCooldown = 0;
				acceptingClick = true;
			}, 500);
			break;
		}
		case 2:
			playVoiceline();
			break;
		case 3:
			if (trackerID != -1) {
				clearInterval(trackerID);
				trackerID = -1;
			}
			if (untrackerID == -1) {
				untrackerID = setInterval(untrackMouse, 20);
			}
			let eyetracking = spineData.state.setAnimation(1, 'LookEnd_01_M', false);
			let eyetracking2 = spineData.state.setAnimation(2, 'LookEnd_01_A', false);
			eyetracking.mixDuration = 0;
			eyetracking2.mixDuration = 0;
			spineData.state.addEmptyAnimation(1, 0.5, 0);
			spineData.state.addEmptyAnimation(2, 0.5, 0);
			break;
		default:
	}
	mouseSelect = -1;
}

// adjusts mouse values for flipped canvas
function setMouse(event) {
	let ax = event.clientX;
	let ay = event.clientY;
	if (flipped) {
		ax = canvas.width - ax;
	}

	return { x: ax - canvas.width * positionX, y: ay - canvas.height * positionY };
}

function updateSubtitleLanguage() {
	let language = subtitleLanguagePreference;
	if (language === 'auto') {
		const locale = interfaceLanguage === 'default' ? steamLanguage : interfaceLanguage;
		const [primary, region] = locale.split(/[-_]/);
		if (primary === 'tchinese' || (primary === 'zh' && ['cht', 'hant', 'tw', 'hk', 'mo'].includes(region))) {
			language = 'TraditionalChinese';
		} else if (primary === 'schinese' || primary === 'zh') {
			language = 'Chinese';
		} else if (primary === 'ja' || primary === 'japanese') {
			language = 'Japanese';
		} else if (primary === 'ko' || primary === 'korean' || primary === 'koreana') {
			language = 'Korean';
		} else {
			language = 'English';
		}
	}

	if (language === window.selectedLanguage) return;
	window.selectedLanguage = language;
	textbox.lang = subtitleLocales[language];
	const clip = currentTracks.at(-1);
	if (dialogBox && clip) textbox.textContent = clip.dialog[language][clip.index];
}

function init() {
	// Wallpaper Engine settings
	window.wallpaperPropertyListener = {
		applyGeneralProperties: (props) => {
			const language = props.language?.value ?? props.language;
			const steamLocale = props.steamlanguage?.value ?? props.steamlanguage;
			if (typeof language !== 'string' && typeof steamLocale !== 'string') return;
			if (typeof language === 'string') interfaceLanguage = language.toLowerCase();
			if (typeof steamLocale === 'string') steamLanguage = steamLocale.toLowerCase();
			updateSubtitleLanguage();
		},
		applyUserProperties: (props) => {
			if (props.schemecolor) {
				bufferColor = props.schemecolor.value.split(" ");
			}
			if (props.alignmentfliph) flipped = props.alignmentfliph.value;
			if (props.scale) {
				customScale = props.scale.value;
				document.documentElement.style.setProperty('--wallpaper-scale', customScale);
			}
			if (props.positionx) {
				positionX = props.positionx.value / 100;
				document.documentElement.style.setProperty('--wallpaper-position-x', props.positionx.value + 'vw');
			}
			if (props.positiony) {
				positionY = props.positiony.value / 100;
				document.documentElement.style.setProperty('--wallpaper-position-y', props.positiony.value + 'vh');
			}
			if (props.scale || props.positionx || props.positiony) resize();
			if (props.targetfps) targetFps = props.targetfps.value;

			if (props.introanimation) introAnimation = props.introanimation.value;

			if (props.mousetracking) mouseOptions.mousetracking = props.mousetracking.value;
			if (props.headpatting) mouseOptions.headpatting = props.headpatting.value;
			if (props.voicelines) mouseOptions.voicelines = props.voicelines.value;
			if (props.voicevolume) volume = props.voicevolume.value / 100;
			if (props.showdialog) dialogBox = props.showdialog.value;
			if (props.dialogx) textbox.style.left = props.dialogx.value + '%';
			if (props.dialogy) textbox.style.top = props.dialogy.value + '%';
			if (props.drawHitboxes) mouseOptions.drawHitboxes = props.drawHitboxes.value;

			// 监听模型分辨率设置
			if (props.modelresolution) modelResolution = props.modelresolution.value;
			if (assetManager && typeof introAnimation !== 'undefined' && !modelFrame &&
				(props.modelresolution || loadingResolution !== modelResolution)) {
				reloadModel();
			}

			if (props.dialoglanguage) {
				const language = props.dialoglanguage.value;
				subtitleLanguagePreference = Object.hasOwn(subtitleLocales, language) ? language : 'auto';
				updateSubtitleLanguage();
			}

			if (props.bgmfile) {
				bgmfile = 'file:///' + props.bgmfile.value.replace("%3A", "\:");
			}
			if (props.bgmvolume) {
				bgmvolume = props.bgmvolume.value / 100;
				if (bgm) bgm.volume = bgmvolume;
			}
		},
		setPaused: function(isPaused) {
				if (bgm) {
					if (isPaused) {
						setTimeout(() => { bgm.volume = 0; }, 200);
					} else {
						setTimeout(() => { bgm.volume = bgmvolume; }, 200);
					}
				}
			}
	};

	textbox = document.getElementById('textbox');
	textbox.lang = subtitleLocales[window.selectedLanguage];

	canvas = document.getElementById('canvas');
	canvas.addEventListener('mouseleave', releaseHeadpatOnExit);
	window.addEventListener('blur', releaseHeadpatOnExit);
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

	overlay = document.getElementById('overlay');
	overlay.width = window.innerWidth;
	overlay.height = window.innerHeight;

	let config = { alpha: false, premultipliedAlpha: false, antialias: true };
	gl = canvas.getContext('webgl', config) || canvas.getContext('experimental-webgl', config);
	if (!gl) {
		alert('WebGL is unavailable.');
		return;
	}

	// Create a simple shader, mesh, model-view-projection matrix, SkeletonRenderer, and AssetManager.
	shader = spine.Shader.newTwoColoredTextured(gl);
	batcher = new spine.PolygonBatcher(gl);
	mvp.ortho2d(0, 0, canvas.width - 1, canvas.height - 1);
	skeletonRenderer = new spine.SkeletonRenderer(gl);
	assetManager = new spine.AssetManager(gl);

	initialLoadTimer = setTimeout(() => {
		if (typeof introAnimation === 'undefined') introAnimation = true;
		if (loadingResolution === undefined && !modelFrame) reloadModel();
	}, 350);

	window.addEventListener('resize', resize);
	window.addEventListener('pagehide', event => {
		if (event.persisted) return;
		canvas.style.visibility = 'hidden';
		clearTimeout(initialLoadTimer);
		cancelAnimationFrame(modelFrame);
		cancelAnimationFrame(renderFrame);
		clearTimeout(renderTimer);
		gl.getExtension('WEBGL_lose_context')?.loseContext();
	});
}

let introAudioIsPlaying = false;
let introAudioTracks = [];
let introTimeouts = [];

// Function to reload the model with a new resolution
function reloadModel() {
	if (!assetManager || modelFrame) return;
	if (mouseSelect === 1 || headpatCooldown) {
		if (mouseSelect === 1) mouseSelect = -1;
		acceptingClick = false;
	}
	clearTimeout(headpatCooldown);
	headpatCooldown = 0;
	headpatOrigin = null;
	headpatTarget.set(0, 0);
	headpatOffset.set(0, 0);

	// Stop the current BGM if it's playing
	if (bgm) {
		bgm.pause();
		bgm = null;
	}
	
	// Stop all intro audio and clear related timeouts
	introAudioIsPlaying = false;
	
	// Stop and clear all intro audio tracks
	introAudioTracks.forEach(track => {
		if (track && !track.paused) {
			track.pause();
			track.currentTime = 0;
		}
	});
	introAudioTracks = [];
	
	// Stop and clear all voiceline audio tracks
	currentTracks.forEach(({ track }) => {
		if (track && !track.paused) {
			track.pause();
			track.currentTime = 0;
		}
	});
	currentTracks = [];
	
	// Clear all intro timeouts
	introTimeouts.forEach(timeout => clearTimeout(timeout));
	introTimeouts = [];
	
	
	// Hide dialog box
	if (textbox) {
		textbox.style.opacity = 0;
	}
	
	canvas.style.visibility = 'hidden';
	cancelAnimationFrame(renderFrame);
	clearTimeout(renderTimer);
	spineData = null;
	assetManager.removeAll();
	loadingResolution = modelResolution;
	const binaryPath = new URL(`assets/${modelResolution}/${CHARACTER}_home_GL.skel`, document.baseURI).href;
	const atlasPath = new URL(`assets/${modelResolution}/${CHARACTER}_home_GL.atlas`, document.baseURI).href;
	assetManager.loadBinary(binaryPath);
	assetManager.loadTextureAtlas(atlasPath);
	function waitForAssets() {
		if (!assetManager.isLoadingComplete()) {
			modelFrame = requestAnimationFrame(waitForAssets);
			return;
		}
		modelFrame = 0;
		if (loadingResolution !== modelResolution) {
			reloadModel();
			return;
		}
		if (assetManager.get(binaryPath) && assetManager.get(atlasPath)) {
			load(binaryPath, atlasPath);
		} else {
			console.error('Model assets not found for resolution: ' + loadingResolution);
			loadingResolution = undefined;
		}
	}
	modelFrame = requestAnimationFrame(waitForAssets);
}

// CITATION: http://esotericsoftware.com/spine-api-reference#
// CITATION: http://en.esotericsoftware.com/forum/Spine-Unity-Making-the-arm-follow-the-mouse-7856
let modelMouseHandlersBound = false;

function interactionLoad() {
	// Touch_Point and Touch_Eye
	TPoint = spineData.skeleton.findBone('Touch_Point');
	TEye = spineData.skeleton.findBone('Touch_Eye');
	EPointX = TEye.x;
	EPointY = TEye.y;

	if (!modelMouseHandlersBound) {
		modelMouseHandlersBound = true;
		downaction = canvas.addEventListener('mousedown', function (event) {
			if (!acceptingClick) {
				return;
			}
			acceptingClick = false;
			let mouseData = setMouse(event);
			pressedMouse(mouseData.x, mouseData.y);
		});
		upaction = canvas.addEventListener('mouseup', function () {
			releasedMouse();
		});
		moveaction = canvas.addEventListener('mousemove', function (event) {
			let mouseData = setMouse(event);
			movedMouse(mouseData.x, mouseData.y);
		});
	}

	if (!introAnimation) {
		acceptingClick = true;
	}
	else {
		setTimeout(function () {
			acceptingClick = true;
		}, INTRO_TIMEOUT);
	}

	return 1;
}

function load(dynamicBinaryPath, dynamicAtlasPath) {
	spineData = loadSpineData(dynamicBinaryPath, dynamicAtlasPath, false);

	// User Option to skip Intro Animation
	if (introAnimation) {
		spineData.state.addAnimation(0, 'Start_Idle_01', false);

		if (mouseOptions.voicelines) {
			let track = new Audio(`./assets/audio/${CHARACTER}_memoriallobby_0.ogg`);
			track.volume = volume;
			setTimeout(function () {
				track.play();
			}, 11500);
		}
	}

	spineData.state.addAnimation(0, 'Idle_01', true, 0);

	interactionLoad();
	resize();

	// Plays user-defined BGM (if set)
	if (!bgm) {
		bgm = new Audio(bgmfile);
		bgm.volume = bgmvolume;
		bgm.loop = true;
		bgm.play();
		bgm.addEventListener('ended', function () {
			this.currentTime = 0;
			this.play();
		}, false);
	}

	lastFrameTime = Date.now() / 1000;
	// Call render every frame.
	render();
	canvas.style.visibility = 'visible';
}

const GLARE_SLOTS = new Set([
	"top_light"
]);
const GLARE_OPACITY = 0.24;

// Scale attachment opacity once so animated slot colors still control the light.
function applyGlareOpacity(skeletonData) {
	for (const skin of skeletonData.skins) {
		for (const { slotIndex, attachment } of skin.getAttachments()) {
			const slot = skeletonData.slots[slotIndex];
			if (!GLARE_SLOTS.has(slot.name) || slot.blendMode !== 1 || !attachment.color) continue;
			attachment.color.a *= GLARE_OPACITY;
		}
	}
}

function loadSpineData(binaryPath, atlasPath, premultipliedAlpha) {
	// Load the texture atlas from the AssetManager.
	let atlas = assetManager.get(atlasPath);

	// Create a AtlasAttachmentLoader that resolves region, mesh, boundingbox and path attachments
	let atlasLoader = new spine.AtlasAttachmentLoader(atlas);

	// Create a SkeletonBinary instance for parsing the .skel file.
	let skeletonBinary = new spine.SkeletonBinary(atlasLoader);

	// Set the scale to apply during parsing, parse the file, and create a new skeleton.
	skeletonBinary.scale = 1;
	let skeletonData = skeletonBinary.readSkeletonData(assetManager.get(binaryPath));
	applyGlareOpacity(skeletonData);
	let skeleton = new spine.Skeleton(skeletonData);
	let bounds = calculateSetupPoseBounds(skeleton);

	// Create an AnimationState, and set the initial animation in looping mode.
	let animationStateData = new spine.AnimationStateData(skeleton.data);
	animationStateData.defaultMix = 0.5;
	let animationState = new spine.AnimationState(animationStateData);

	// Pack everything up and return to caller.
	return { skeleton: skeleton, state: animationState, bounds: bounds, premultipliedAlpha: premultipliedAlpha };
}

function calculateSetupPoseBounds(skeleton) {
	skeleton.setToSetupPose();
	skeleton.updateWorldTransform(spine.Physics.update);
	let offset = new spine.Vector2();
	let size = new spine.Vector2();
	skeleton.getBounds(offset, size, []);
	return { offset: offset, size: size };
}

let topLightSlotHidden = false;

function render() {
    let now = Date.now() / 1000;
    let delta = now - lastFrameTime;

    lastFrameTime = now;

    gl.clearColor(bufferColor[0], bufferColor[1], bufferColor[2], 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Only render if spineData is available
    if (spineData) {
        // Apply the animation state based on the delta time.
        let skeleton = spineData.skeleton;
        let state = spineData.state;
        let premultipliedAlpha = spineData.premultipliedAlpha;
        state.update(delta);
		state.apply(skeleton);
		// 在首次渲染时隐藏 top_light 
		if (!topLightSlotHidden) {
			let slot = skeleton.findSlot("top_light");
			if (slot) slot.setAttachment(null);
			topLightSlotHidden = true;
		}
        const pointX = TPoint.x;
        const pointY = TPoint.y;
        applyHeadpat(delta);
        skeleton.updateWorldTransform(spine.Physics.update);
        TPoint.x = pointX;
        TPoint.y = pointY;

        // Bind the shader and set the texture and model-view-projection matrix.
        shader.bind();
        // 修改这两行，从 spine.webgl.Shader 改为 spine.Shader
        shader.setUniformi(spine.Shader.SAMPLER, 0);
        shader.setUniform4x4f(spine.Shader.MVP_MATRIX, mvp.values);

        // Start the batch and tell the SkeletonRenderer to render the active skeleton.
        batcher.begin(shader);
        skeletonRenderer.premultipliedAlpha = premultipliedAlpha;
        skeletonRenderer.draw(batcher, skeleton);
        batcher.end();

        shader.unbind();
	}

    // throttle fps
	let elapsed = Date.now() / 1000 - now;
	let targetFrameTime = 1 / targetFps;
	let delay = Math.max(targetFrameTime - elapsed, 0) * 1000;

	drawHitboxes();

	renderTimer = setTimeout(() => {
		renderFrame = requestAnimationFrame(render);
	}, delay);
}

function resize() {
	let w = canvas.clientWidth;
	let h = canvas.clientHeight;
	if (w === 0 || h === 0) return;
	if (canvas.width != w || canvas.height != h) {
		canvas.width = w;
		canvas.height = h;
		overlay.width = w;
		overlay.height = h;
	}

	// Set values to position skeleton to center of canvas.
	// Will always attempt to Fit to Fill while maintaining aspect ratio. As a result, a scale of [1] will mean different things across various device resolutions.
	let centerX = 0;
	let centerY = 900;
	let wr = canvas.width / 2560;
	let hr = canvas.height / 1600;
	let width = (2560 / customScale);
	let height = (1600 / customScale);

	if (wr < hr) {
		width = height * (canvas.width / canvas.height);

		transpose = 1600 / canvas.height;
	}
	else if (wr > hr) {
		height = width * (canvas.height / canvas.width);

		transpose = 2560 / canvas.width;
	}
	else {
		transpose = 1600 / canvas.height;
	}

	mvp.ortho2d(centerX - width / 2 - positionX * width, centerY - height / 2 + positionY * height, width, height);
	gl.viewport(0, 0, canvas.width, canvas.height);
}

init();
