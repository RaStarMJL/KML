<template>
		<view
			id="drag_view"
			class="drag"
			:style="'left: ' + left + 'px; top:' + top + 'px;'"
			@touchstart="touchstart"
			@touchmove.stop.prevent="touchmove"
			@touchend="touchend"
			@click="handleClick"
			:class="{transition: isDock && !isMoveing }">
			<slot></slot>
		</view>
</template>

<script>
	export default {
		name: 'wmdragview',
		props: {
			isDock:{//是否自动回到距离最近的边界（自动吸边）
				type: Boolean,
				default: true
			},
			existTabBar:{//页面是否存在底部tabbar
				type: Boolean,
				default: false
			},
			x:{//初始化坐标x
				type:Number,
				default:0
			},
			y:{//初始化坐标y
				type:Number,
				default:0
			}
		},
		data() {
			return {
				top:0,
				left:0,
				width: 0,
				height: 0,
				pageInX:0,
				pageInY:0,
				pageInLeft: 0,
				pageInTop: 0,
				windowWidth: 0,
				windowHeight: 0,
				isMoveing: true,//是否正在被拖动中
				edge: 0,//自动黏贴边界后的距离gap空隙
			}
		},
		mounted() {
			const sys = uni.getSystemInfoSync();
			this.windowWidth = sys.windowWidth;
			this.windowHeight = sys.windowHeight;
			// #ifdef APP-PLUS
				this.existTabBar && (this.windowHeight -= 50);
			// #endif
			if (sys.windowTop) {
				this.windowHeight += sys.windowTop;
			}
			const query = uni.createSelectorQuery().in(this);
			query.select('#drag_view').boundingClientRect(data => {
				this.width = data.width;
				this.height = data.height;
				this.left = this.x?(this.edge+this.x):(this.windowWidth - this.width - this.edge);
				this.top = this.y?(this.edge+this.y):(this.windowHeight - this.height - this.edge);
			}).exec();
		},
		methods: {
			handleClick(e) {
				this.$emit('clickDragView',e);
			},
			touchstart(e) {
				this.pageInX = e.touches[0].pageX;
				this.pageInY = e.touches[0].pageY;
				this.pageInLeft = this.left
    			this.pageInTop = this.top;
				this.$emit('touchstart',e);
			},
			touchmove(e) {
				if (e.touches.length !== 1) {// 单指触摸
					return false;
				}
				this.isMoveing = true;
				this.left = this.pageInLeft + e.touches[0].pageX - this.pageInX;
				this.top = this.pageInTop + e.touches[0].pageY - this.pageInY;
				// #ifdef H5
					// clientY += this.height;
				// #endif
				// let edgeBottom = this.windowHeight - this.height - this.edge;

				// 上下触及边界
				// if (clientY < this.edge) {
				// 	this.top = this.edge;
				// } else if (clientY > edgeBottom) {
				// 	this.top = edgeBottom;
				// } else {
				// 	this.top = clientY
				// }
				// this.top = clientY
				this.$emit('touchmove',e);
			},
			touchend(e) {
				if (this.isDock) {
					let edgeRigth = this.windowWidth - this.width - this.edge
					let edgeBottom = this.windowHeight - this.height - this.edge
					if (this.left < this.windowWidth/2 - this.width/2) {
						this.left = this.edge
					} else {
						this.left = edgeRigth
					}
					if (this.top < 0) {//拖动到nav顶部并且超出屏幕外
						this.top = this.edge
					} else if(this.top+this.height + this.edge - this.windowHeight>0) {//拖动到屏幕底部，并且超出屏幕外
						this.top = edgeBottom
					}
				}
				this.isMoveing = false;
				this.$emit('touchend',e);
			},
		},
}
</script>

<style lang="scss">
	.drag {
		display: flex;
		justify-content: center;
		align-items: center;
		color: $uni-text-color-inverse;
		font-size: $uni-font-size-sm;
		position: fixed;
		z-index: 999999;
		&.transition {
			transition: left .3s ease,top .3s ease;
		}
	}
</style>
