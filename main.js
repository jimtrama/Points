const canvas = document.getElementById("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const ctx = canvas.getContext("2d");
const point = new Point({ x: 100, y: 100, radius: 40, color: "red" });
const point2 = new Point({ x: 200, y: 200, radius: 40, color: "blue" });
const types = ["red","blue","green","yellow","purple","orange"];
const relations = generateRelations(types);
const points = generatePoints(2,relations); 

function generatePoints(n,relations) {
    let p = [];
    for (let i = 0; i < n; i++) {
        let colorIndex = Math.floor(Math.random()*types.length);
        p.push(
            new Point({
                relations,
                id:i,
                x: Math.random() * (canvas.width-20) + 10,
                y: Math.random() * (canvas.height-20)+10,
                radius: 10,
                color: types[colorIndex],
                iType:colorIndex
            })
        );
    }
    
    for (let i = 0; i < n; i++) {
       
        p[i].otherPoints = (getOtherPoints(p,i));
       
    }
    return p;
}
function getOtherPoints(points,index){
    let p = [];
    for (let i = 0; i < points.length; i++) {
        if(points[i].id!=index){
         p.push(points[i]);
        } 
     }
     return p;
}
function generateRelations(types){
    let r = [];
    for(let i = 0 ; i < types.length;i++){
        let slice = [];
        for (let j = 0 ;j<types.length;j++){
            const attraction = Math.random()*2-1;
            slice.push(attraction);
        }
        r.push(slice);
    }
    return r;
}
animate();
function animate(time) {
    const seconds = time / 1000;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
 
    for (const point of points) {
        point.update();
        point.draw(ctx);   
    }
 
    
    requestAnimationFrame(animate);
}
