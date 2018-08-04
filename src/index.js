// 闭包，自执行函数，防止变量冲突
var rating = (function(){
		
  // 继承
  var extend = function(sunClass,fatherClass){ // sunClass 子类 fatherClass 父类
    var F = function(){};
    F.prototype = fatherClass.prototype;
    sunClass.prototype = new F();
    sunClass.prototype.constructor = sunClass;
  }
  
  // 提取出抽象父类 Light
  var Light = function(el,options){
    // 定义dom 变成jquery对象的形式
    this.$el = $(el);
    this.$item = this.$el.find('.rating-item');
    this.opts = options;
    this.add = 1;
    this.selectEvent = 'mouseover';
  }
  // 初始化方法
  Light.prototype.init = function(){
    this.lightOn(this.opts.num); // this.opts.num 默认点亮的星星个数
    if(!this.opts.readOnly){ // 如果不是只读 才绑定事件
      this.bindEvent();// 要绑定的事件
    } 
  }
  // 点亮
  Light.prototype.lightOn = function(num){
    num = parseInt(num); // 转化成整数
    this.$item.each(function(index,el) {
        if(index<num) {
          $(this).css('background-position','0 -40px');
        }else{
          $(this).css('background-position','0 0');
        }
      })
  };
  // 绑定事件
  Light.prototype.bindEvent = function(){
    var self = this,
    itemLength = self.$item.length;
    
    self.$el.on(self.selectEvent,'.rating-item',function(e) {
      var $this = $(this),
      num = 0;
       
      self.select(e,$this);
      num = $(this).index()+self.add;
      self.lightOn(num);
      
      // 执行select方法，打印出当前鼠标移动到第几颗星星
      // 判断self.opts.select如果是函数，才执行self.opts.select()方法
      (typeof self.opts.select === 'function') && self.opts.select.call(this,num,itemLength); //.call(this,num,itemLength) 改变this指向当前星星
    }).on('click','.rating-item',function() {
      self.opts.num = $(this).index() + self.add;
      (typeof self.opts.chosen === 'function') && self.opts.chosen.call(this,self.opts.num,itemLength);
    }).on('mouseout',function() {
      self.lightOn(self.opts.num);
    }); 	
  };
  Light.prototype.select = function(){
    throw new Error('子类必须重写此方法');
  }
  Light.prototype.unbindEvent = function(){
     this.$el.off();
  }
  
  
  // 点亮整颗  面向对象的写法
  var LightEntire = function(el,options){
    Light.call(this,el,options);// this继承绑定父类里的内容
    this.selectEvent = 'mouseover';
  }
  extend(LightEntire,Light);
  // 点亮
  LightEntire.prototype.lightOn = function(num){
     Light.prototype.lightOn.call(this,num); // 调用父类的lightOn方法，把自己的this传进去
  };
  LightEntire.prototype.select = function(){
    self.add = 1;
  }
  
  
  // 点亮半颗  面向对象的写法
  var LightHalf = function(el,options){
    Light.call(this,el,options);// this继承绑定父类里的内容
    this.selectEvent = 'mousemove';	
  }
        extend(LightHalf,Light);
  // 点亮
  LightHalf.prototype.lightOn = function(num){
    var count = parseInt(num),
    isHalf = count !== num; // 转化成整数不等于其本身则为半颗
    Light.prototype.lightOn.call(this,count); // 调用父类的lightOn方法，把自己的this传进去
      if(isHalf){
        this.$item.eq(count).css('background-position','0 -80px');
      }	
  };
  LightHalf.prototype.select = function(e,$this){
    if(e.pageX - $this.offset().left < $this.width()/2){
      this.add = 0.5;
    }else{
      this.add = 1;
    }
  }
  
  // 默认参数
  var defaults = {
    mode: "LightEntire",
    num: 0,
    readOnly: false,
    select: function(){}, // 鼠标移动星星上执行的方法
    chosen: function(){}  // 鼠标点击星星执行的方法
  };
  var mode = { // 映射 将字符串转化为对象，函数
    'LightEntire': LightEntire,
    'LightHalf': LightHalf
  };
  
  // 初始化方法，方便和外界通信,  
  var init = function(el,option){
    var $el = $(el),
        rating = $el.data('rating'),
        options = $.extend({},defaults,typeof option === 'object' && option); // 如果option是对象  options覆盖defaults,然后存放到空对象中，再赋值到options保存
            if(!mode[options.mode]){ // 实例化mode前先判断，不存在时手动设置一个值
              options.mode = 'LightEntire'
            }
            if(!rating){
              $el.data('rating',(rating = new mode[options.mode](el,options)));
            // 实例化mode
            rating.init();
            }
            if(typeof option === 'string'){
              rating[option]();
            }  
  };
  
  // jQuery插件
  $.fn.extend({
    rating: function(option){
      return this.each(function(){
        init(this,options);
      });
    }
  });
  
  return{ // 返回对象，init方法  在外部var rating全局变量来接收
    init:init
  }
})();

// 通过rating.init()来调用init方法
 
rating.init('#rating1',{
  mode: 'LightEntire', // 默认点亮状态在这里设置即可
  num: 3,
  select: function(num,total){
    console.log(this);
    console.log(num +'/' + total);
  },
  chosen: function(num,total){
    console.log(num +'/' + total);
  },
  
});
rating.init('#rating2',{
  mode: 'LightHalf', // 默认点亮状态在这里设置即可
  num: 3.5,
  select: function(num,total){
  },
  chosen: function(num,total){
    // 解绑
    rating.init('#rating2','unbindEvent');
  },
  
});
rating.init('#rating3',{
  mode: 'LightHalf', // 默认点亮状态在这里设置即可
  num: 4.5,
  select: function(num,total){
    // 解绑
    rating.init('#rating3','unbindEvent');
  },
  chosen: function(num,total){		 
  },			
});
