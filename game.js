
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = 1000;
canvas.height = 500;

const mario = new Image();
mario.src = "mario.png";
let marioLoaded = false;
mario.onload = () => marioLoaded = true;

let player = {
    x:100,y:380,w:55,h:55,
    vx:0,vy:0,speed:6,jump:-14,onGround:false
};

let score=0,lives=3,levelLength=3200,cameraX=0,win=false;

const platforms=[
 {x:250,y:380,w:150,h:20},
 {x:500,y:320,w:150,h:20},
 {x:800,y:260,w:150,h:20},
 {x:1200,y:340,w:180,h:20},
 {x:1600,y:280,w:180,h:20},
 {x:2050,y:220,w:180,h:20}
];

const coins=[];
for(let i=0;i<20;i++){
 coins.push({x:250+i*140,y:120+Math.random()*180,taken:false});
}

const enemies=[
 {x:700,y:390,w:45,h:45,s:2,min:650,max:900,alive:true},
 {x:1400,y:390,w:45,h:45,s:3,min:1350,max:1600,alive:true},
 {x:2200,y:390,w:45,h:45,s:2.5,min:2150,max:2450,alive:true}
];

const keys={};
addEventListener("keydown",e=>keys[e.code]=true);
addEventListener("keyup",e=>keys[e.code]=false);

function resetPos(){
 player.x=100; player.y=380; player.vx=0; player.vy=0;
}

function update(){
 if(win) return;

 player.vx=0;
 if(keys["ArrowLeft"]) player.vx=-player.speed;
 if(keys["ArrowRight"]) player.vx=player.speed;

 if((keys["Space"]||keys["ArrowUp"]) && player.onGround){
   player.vy=player.jump;
   player.onGround=false;
 }

 player.x+=player.vx;
 player.vy+=0.7;
 player.y+=player.vy;

 player.onGround=false;

 if(player.y+player.h>=445){
   player.y=445-player.h;
   player.vy=0;
   player.onGround=true;
 }

 platforms.forEach(p=>{
   if(player.x+player.w>p.x && player.x<p.x+p.w &&
      player.y+player.h>=p.y && player.y+player.h<=p.y+25 &&
      player.vy>=0){
      player.y=p.y-player.h;
      player.vy=0;
      player.onGround=true;
   }
 });

 coins.forEach(c=>{
   if(!c.taken &&
      player.x<c.x+20 && player.x+player.w>c.x-20 &&
      player.y<c.y+20 && player.y+player.h>c.y-20){
      c.taken=true;
      score+=10;
   }
 });

 enemies.forEach(e=>{
   if(!e.alive) return;
   e.x+=e.s;
   if(e.x<e.min || e.x>e.max) e.s*=-1;

   if(player.x<e.x+e.w && player.x+player.w>e.x &&
      player.y<e.y+e.h && player.y+player.h>e.y){

      if(player.vy>0 && player.y+player.h-10<e.y){
         e.alive=false;
         score+=50;
         player.vy=-10;
      }else{
         lives--;
         resetPos();
         if(lives<=0){
            alert("Game Over! Score: "+score);
            location.reload();
         }
      }
   }
 });

 if(player.x>levelLength-250){
   win=true;
 }

 cameraX=Math.max(0,Math.min(player.x-350,levelLength-canvas.width));
}

function draw(){
 update();

 ctx.clearRect(0,0,canvas.width,canvas.height);

 const sky=ctx.createLinearGradient(0,0,0,500);
 sky.addColorStop(0,"#7ec8ff");
 sky.addColorStop(1,"#dff5ff");
 ctx.fillStyle=sky;
 ctx.fillRect(0,0,canvas.width,canvas.height);

 ctx.fillStyle="white";
 for(let i=0;i<8;i++) ctx.fillRect((i*220-cameraX*0.3)%1800,60+(i%3)*30,80,25);

 ctx.fillStyle="#2fa34f";
 ctx.fillRect(0,445,canvas.width,55);

 platforms.forEach(p=>{
   ctx.fillStyle="#8b5a2b";
   ctx.fillRect(p.x-cameraX,p.y,p.w,p.h);
 });

 coins.forEach(c=>{
   if(c.taken) return;
   ctx.fillStyle="gold";
   ctx.beginPath();
   ctx.arc(c.x-cameraX,c.y,12,0,Math.PI*2);
   ctx.fill();
 });

 enemies.forEach(e=>{
   if(!e.alive) return;
   ctx.fillStyle="#6b3fa0";
   ctx.fillRect(e.x-cameraX,e.y,e.w,e.h);
   ctx.fillStyle="white";
   ctx.fillRect(e.x-cameraX+8,e.y+10,6,6);
   ctx.fillRect(e.x-cameraX+28,e.y+10,6,6);
   ctx.fillStyle="black";
   ctx.fillRect(e.x-cameraX+10,e.y+12,2,2);
   ctx.fillRect(e.x-cameraX+30,e.y+12,2,2);
 });

 if(marioLoaded){
   ctx.drawImage(mario,player.x-cameraX,player.y,player.w,player.h);
 } else {
   ctx.fillStyle="red";
   ctx.fillRect(player.x-cameraX,player.y,player.w,player.h);
 }

 ctx.fillStyle="black";
 ctx.font="26px Arial";
 ctx.fillText("Score: "+score,20,35);
 ctx.fillText("Lives: "+lives,20,70);

 ctx.fillText("🏁", levelLength-cameraX-120, 420);

 if(win){
   ctx.font="48px Arial";
   ctx.fillText("LEVEL COMPLETE!",320,220);
 }

 requestAnimationFrame(draw);
}
draw();
