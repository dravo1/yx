window.yx={
	g:function(name){
		return document.querySelector(name);
	},
	ga:function(name){
		return document.querySelectorAll(name);
	},
	addEvent:function(obj,ev,fn){
		if(obj.addEventListener){
			obj.addEventListener(ev,fn);
		}else{
			obj.attachEvent('on'+ev,fn);
		}
	},
	removeEvent:function(obj,ev,fn){
		if(obj.removeEventListener){
			obj.removeEventListener(ev,fn);
		}else{
			obj.detachEvent('on'+ev,fn);
		}
	},
	getTopValue:function(obj){			//获取元素到html的距离
		var top=0;
		while(obj.offsetParent){
			top+=obj.offsetTop;
			obj=obj.offsetParent;
		}
		
		return top;
	},
	cutTime:function(target){			//倒计时
		var currentDate=new Date();
		var v=Math.abs(target-currentDate);
		
		return {
			d:parseInt(v/(24*3600000)),
			h:parseInt(v%(24*3600000)/3600000),
			m:parseInt(v%(24*3600000)%3600000/60000),
			s:parseInt(v%(24*3600000)%3600000%60000/1000),
		};
	},
	format:function(v){					//给时间补零
		return v<10?'0'+v:v;
	},
	formatDate:function(time){
		var d=new Date(time);
		return d.getFullYear()+'-'+yx.format(d.getMonth()+1)+'-'+yx.format(d.getDate())+' '+yx.format(d.getHours())+':'+yx.format(d.getMinutes());
	},
	parseUrl:function(url){				//把url后面的数据解析成对象
		var reg=/(\w+)=(\w+)/ig;
		var result={};
		
		url.replace(reg,function(a,b,c){
			result[b]=c;
		});
		
		return result;
	},
	public:{
		navFn:function(){
			var nav=yx.g('.nav');
			var lis=yx.ga('.navBar li');
			var subNav=yx.g('.subNav');
			var uls=yx.ga('.subNav ul');
			var newLis=[];			//存储实际选项卡要用的li
			
			for(var i=1;i<lis.length-3;i++){
				newLis.push(lis[i]);
			}
			
			for(var i=0;i<newLis.length;i++){
				newLis[i].index=uls[i].index=i;
				newLis[i].onmouseenter=uls[i].onmouseenter=function(){
					newLis[this.index].className="active";
					subNav.style.opacity=1;
					uls[this.index].style.display='block';
				};
				newLis[i].onmouseleave=uls[i].onmouseleave=function(){
					newLis[this.index].className="";
					subNav.style.opacity=0;
					uls[this.index].style.display='none';
				};
			}
			
			yx.addEvent(window,'scroll',setNavPos);
			setNavPos();
			function setNavPos(){
				nav.id=window.pageYOffset>nav.offsetTop?'navFix':'';
			}
		},
		shopFn:function(){			//购物车
			
			//购物车添加商品
			var productNum=0;		//购买商品数
			(function(local){
				var totalPrice=0;
				var ul=yx.g('.cart ul');
				var li='';
				ul.innerHTML='';
				
				for(var i=0;i<local.length;i++){
					var attr=local.key(i);
					var value=JSON.parse(local[attr]);
					
					if(value&&value.sign=='productLocal'){	//确认是自己添加的local
						li+='<li data-id="'+value.id+'">'+
								'<a href="#" class="img"><img src="'+value.img+'"/></a>'+
								'<div class="message">'+
									'<p><a href="#">'+value.name+'</a></p>'+
									'<p>'+value.spec.join(' ')+' x '+value.num+'</p>'+
								'</div>'+
								'<div class="price">￥'+value.price+'</div>'+
								'<div class="close">X</div>'+
							'</li>';
							
							totalPrice+=parseFloat(value.price)*Number(value.num);
					}
				}
				ul.innerHTML=li;
				
				productNum=ul.children.length;
				if(productNum>99){
					productNum='99+'
				}
				yx.g('.cartWrap i').innerHTML=productNum;
				yx.g('.cartWrap .total span').innerHTML='￥'+totalPrice+'.00'
				
				
				//删除商品
				var closeBtns=yx.ga('.cart .list .close');
				for(var i=0;i<closeBtns.length;i++){
					closeBtns[i].onclick=function(){
						localStorage.removeItem(this.parentNode.getAttribute('data-id'));
						yx.public.shopFn();
						
						if(ul.children.length==0){
							yx.g('.cart').style.display='none';
						}
					};
				}
				
				var cartWarp=yx.g('.cartWrap');
				var timer;
				
				cartWarp.onmouseenter=function(){
					clearTimeout(timer);
					if(ul.children.length>0){
						yx.g('.cart').style.display='block';
					scrollFn();
					}
				};
				cartWarp.onmouseleave=function(){
					timer=setTimeout(function(){
						yx.g('.cart').style.display='none';
					},100);
				};
				
			})(localStorage);
			
			//滚动条
			function scrollFn(){
				var contentWrap=yx.g('.cart .list');
				var content=yx.g('.cart .list ul');
				var scrollBar=yx.g('.cart .scrollBar');
				var slide=yx.g('.cart .slide');
				var slideWrap=yx.g('.cart .slideWrap');
				var btns=yx.ga('.cart .scrollBar span');
				var timer;
				
				//倍数
				var beishu=content.offsetHeight/contentWrap.offsetHeight;
				scrollBar.style.display<=1?'none':'block';
				
				if(beishu>20){
					beishu=20;
				}
				
				slide.style.height=slideWrap.offsetHeight/beishu+'px';
				
				
				//拖拽
				var scrollTop=0;			//滑块走的距离
				var maxHeight=slideWrap.offsetHeight-slide.offsetHeight;	//滑块能走多远
				
				slide.onmousedown=function(ev){
					var disY=ev.clientY-slide.offsetTop;
					document.onmousemove=function(ev){
						scrollTop=ev.clientY-disY;
						scroll();
					};
					document.onmouseup=function(){
						this.onmousemove=null;
					};
					
					ev.cancelBubble=true;
					return false;
				};
				
				//滚轮滚动功能
				myScroll(contentWrap,function(){
					scrollTop-=10;
					scroll();
					clearInterval(timer);
				},function(){
					scrollTop+=10;
					scroll();
					clearInterval(timer);
				});
				
				//上下箭头功能
				for(var i=0;i<btns.length;i++){
					btns[i].index=i;
					btns[i].onmousedown=function(){
						var n=this.index;
						timer=setInterval(function(){
							scrollTop=n?scrollTop+5:scrollTop-5;
						},16);
					};
					btns[i].onmouseup=function(){
						clearInterval(timer);
					};
				};
				
				//滑块区域点击事件
				slideWrap.onmousedown=function(ev){
					timer=setInterval(function(){
						var slideTop=slide.getBoundingClientRect().top+slide.offsetHeight/2;
						
						if(ev.clientY<slideTop){
							scrollTop-=5;
						}else{
							scrollTop+=5;
						}
						
						if(Math.abs(ev.clientY-slideTop)<=5){
							clearInterval(timer);
						}
						
					},16);
				};
				
				//滚动条主体事件
				function scroll(){
					if(scrollTop<0){
						scrollTop=0;
					}else if(scrollTop>maxHeight){
						scrollTop=maxHeight;
					}
					
					var scaleY=scrollTop/maxHeight;
					
					slide.style.top=scrollTop+'px';
					content.style.top=(contentWrap.offsetHeight-content.offsetHeight)*scaleY+'px';
				};
				
				//滚轮事件
				function myScroll(obj,fnUp,fnDown){
					obj.onmousewheel=fn;
					obj.addEventListener('DOMMouseScroll',fn);
					
					function fn(ev){
						if(ev.wheelDelta>0 || ev.detail<0){
							fnUp.call(obj);
						}else{
							fnDown.call(obj);
						}
						
						ev.preventDefault();
						return false;
					};
				};
				
			};
			
		},
		/*图片懒加载功能*/
		lazyImgFn:function(){
			yx.addEvent(window,'scroll',delayImg);
			delayImg();
			function delayImg(){
				var originals=yx.ga('.original');
				var scrollTop=window.innerHeight+window.pageYOffset;
				
				for(var i=0;i<originals.length;i++){
					if(yx.getTopValue(originals[i])<scrollTop){
						originals[i].src=originals[i].getAttribute('data-original');
						originals[i].removeAttribute('class');		//清除默认背景图片
					}
				}
				
				if(originals[originals.length-1].getAttribute('src')!=='img/empty.gif'){
					//条件成立时，所有图片都已加载过
					yx.removeEvent(window,'scroll',delayImg);
				}
			}
		},
	
		/*回顶功能*/
		backUpFn:function(){
			var back=yx.g('.back');
			var timer;
			back.onclick=function(){
				var top=window.pageYOffset;
				
				timer=setInterval(function(){
					top-=150;
					if(top<=0){
						top=0;
						clearInterval(timer);
					}
					
					window.scrollTo(0,top);
				},16)
			}
		}
	}
}
