class Point {
    constructor({ x, y, radius, color, id, relations, iType }) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.iType = iType;
        this.relations = relations;
        this.otherPoints = [];
        this.rayCount = 12;
        this.raySpread = Math.PI * 2;
        this.rayLength = 100;
        this.rays=[];
        this.readings=[];
    }
    update() {
        this.#castRays();
        this.readings = [];
        for (let i = 0; i < this.rays.length; i++) {
            let r = this.#getReading(this.rays[i], this.otherPoints)
           // console.log(r);
            if(r.length!=0){
                this.readings.push(r);
            }
            
        }
       // console.log(this.readings.length);
        this.findDir(this.readings);
        //this.#checkEnd();
    }
    findDir(touches) {
        let mDistance = this.#getMaxPointDistance();
        for (let point of this.otherPoints) {
            let distance = this.#getDistance(this.x, this.y, point.x, point.y);
            const toX = this.x+((point.x - this.x) * (this.relations[this.iType][point.iType] / distance));
            const toY = this.y+((point.y - this.y) * (this.relations[this.iType][point.iType] / distance));
            let ok = true;
            
            
            for (const touch of touches) {
                
                if(toX > touch[0][0]  || toY>touch[0][1]){
                    ok = false;
                 
                }
            }
            if (ok) {
                this.x = toX ;
                this.y = toY;
            }
        }
    }
    #getReading(ray, otherPoints) {
        
        let touches = [];
        for (let point of otherPoints) {
            const touch = this.getIntersections([ray.startPoint.x,ray.startPoint.y],[ray.endPoint.x,ray.endPoint.y],[point.radius,point.x,point.y]);
            console.log(touch.pointOnLine);
            if (touch.length!=0) {
                touches.push(touch);
            }
        }
        if (touches.length == 0) {
            return [];
        }
        return touches;
    }
    getIntersection(p1, p2, circleCenter, radius) {
        p1.x -= circleCenter.x
        p2.x -= circleCenter.x
        p1.y -= circleCenter.y
        p2.y -= circleCenter.y
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dr = Math.sqrt(dx*dx + dy*dy);
        const D  = p1.x*p2.y - p2.x*p1.y;

        const tTop = (D.x - C.x) * (A.y - C.y) - (D.y - C.y) * (A.x - C.x);
        const uTop = (C.y - A.y) * (A.x - B.x) - (C.x - A.x) * (A.y - B.y);
        const bottom = (D.y - C.y) * (B.x - A.x) - (D.x - C.x) * (B.y - A.y);
    
        if (bottom != 0) {
            const t = tTop / bottom;
            const u = uTop / bottom;
            if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
                return {
                    x: this.lerp(A.x, B.x, t),
                    y: this.lerp(A.y, B.y, t),
                    offset: t,
                };
            }
        }
        return null;
    }
    inteceptCircleLineSeg(circle, line){
        var a, b, c, d, u1, u2, ret, retP1, retP2, v1, v2;
        v1 = {};
        v2 = {};
        v1.x = line.p2.x - line.p1.x;
        v1.y = line.p2.y - line.p1.y;
        v2.x = line.p1.x - circle.center.x;
        v2.y = line.p1.y - circle.center.y;
        b = (v1.x * v2.x - v1.y * v2.y);
        c = 2 * (v1.x * v1.x + v1.y * v1.y);
        b *= -2;
        d = Math.sqrt(b * b - 2 * c * (v2.x * v2.x + v2.y * v2.y - circle.radius * circle.radius));
        
        if(isNaN(d)){ // no intercept
            return [];
        }
        u1 = (b - d) / c;  // these represent the unit distance of point one and two on the line
        u2 = (b + d) / c;    
        retP1 = {};   // return points
        retP2 = {}  
        ret = []; // return array
        if(u1 <= 1 && u1 >= 0){  // add point if on the line segment
            retP1.x = line.p1.x + v1.x * u1;
            retP1.y = line.p1.y + v1.y * u1;
            ret[0] = retP1;
        }
        if(u2 <= 1 && u2 >= 0){  // second add point if on the line segment
            retP2.x = line.p1.x + v1.x * u2;
            retP2.y = line.p1.y + v1.y * u2;
            ret[ret.length] = retP2;
        }   
        console.log(ret);    
        return ret;
    }
    findCircleLineIntersections(r, h, k, x1,y1,x2,y2) {


        let m = (y1-y2)/(x1-x2);
        let n = y2 - m*x2;
        // circle: (x - h)^2 + (y - k)^2 = r^2
        // line: y = m * x + n
        // r: circle radius
        // h: x value of circle centre
        // k: y value of circle centre
        // m: slope
        // n: y-intercept
    
        // get a, b, c values
        let a = 1 + m*m;
        let b = -h * 2 + (m * (n - k)) * 2;
        let c = h*h + Math.pow(n - k,2) - (r*r);
    
        // get discriminant
        let d = b*b - 4 * a * c;
        if (d >= 0) {
            // insert into quadratic formula
            let intersections = [
                (-b + Math.sqrt(b*b - 4 * a * c)) / (2 * a),
                (-b - Math.sqrt(b*b - 4 * a * c)) / (2 * a)
            ];
            if (d == 0) {
                // only 1 intersection
                return [intersections[0]];
            }
            return intersections;
        }
        // no intersection
        return [];
    }
    getIntersections(a, b, c) {
        // Calculate the euclidean distance between a & b
        let eDistAtoB = Math.sqrt( Math.pow(b[0]-a[0], 2) + Math.pow(b[1]-a[1], 2) );
    
        // compute the direction vector d from a to b
        let d = [ (b[0]-a[0])/eDistAtoB, (b[1]-a[1])/eDistAtoB ];
    
        // Now the line equation is x = dx*t + ax, y = dy*t + ay with 0 <= t <= 1.
    
        // compute the value t of the closest point to the circle center (cx, cy)
        let t = (d[0] * (c[0]-a[0])) + (d[1] * (c[1]-a[1]));
    
        // compute the coordinates of the point e on line and closest to c
        let e = {coords:[], onLine:false};
        e.coords[0] = (t * d[0]) + a[0];
        e.coords[1] = (t * d[1]) + a[1];
    
        // Calculate the euclidean distance between c & e
        let eDistCtoE = Math.sqrt( Math.pow(e.coords[0]-c[0], 2) + Math.pow(e.coords[1]-c[1], 2) );
    
        // test if the line intersects the circle
        if( eDistCtoE < c[2] ) {
            // compute distance from t to circle intersection point
            let dt = Math.sqrt( Math.pow(c[2], 2) - Math.pow(eDistCtoE, 2));
    
            // compute first intersection point
            var f = {coords:[], onLine:false};
            f.coords[0] = ((t-dt) * d[0]) + a[0];
            f.coords[1] = ((t-dt) * d[1]) + a[1];
            // check if f lies on the line
            f.onLine = this.is_on(a,b,f.coords);
    
            // compute second intersection point
            var g = {coords:[], onLine:false};
            g.coords[0] = ((t+dt) * d[0]) + a[0];
            g.coords[1] = ((t+dt) * d[1]) + a[1];
            // check if g lies on the line
            g.onLine = this.is_on(a,b,g.coords);
    
            return {points: {intersection1:f, intersection2:g}, pointOnLine: e};
    
        } else if (parseInt(eDistCtoE) === parseInt(c[2])) {
            // console.log("Only one intersection");
            return {points: false, pointOnLine: e};
        } else {
            // console.log("No intersection");
            return {points: false, pointOnLine: e};
        }
    }
    
    // BASIC GEOMETRIC functions
    distance(a,b) {
        return Math.sqrt( Math.pow(a[0]-b[0], 2) + Math.pow(a[1]-b[1], 2) )
    }
    is_on(a, b, c) {
        return this.distance(a,c) + this.distance(c,b) == this.distance(a,b);
    }
    
    getAngles(a, b, c) {
        // calculate the angle between ab and ac
        angleAB = Math.atan2( b[1] - a[1], b[0] - a[0] );
        angleAC = Math.atan2( c[1] - a[1], c[0] - a[0] );
        angleBC = Math.atan2( b[1] - c[1], b[0] - c[0] );
        angleA = Math.abs((angleAB - angleAC) * (180/Math.PI));
        angleB = Math.abs((angleAB - angleBC) * (180/Math.PI));
        return [angleA, angleB];
    }
    lerp(A, B, t) {
        return A + (B - A) * t;
    }
    #castRays() {
        this.rays = [];
        const startingAngle = this.raySpread / 2 ;
        for (let i = 0; i < this.rayCount; i++) {
            const rayAngel = startingAngle - (this.raySpread / this.rayCount) * i - this.raySpread / this.rayCount / 2;
            const startPoint = { x: this.x, y: this.y };
            const endPoint = {
                x: this.x - Math.sin(rayAngel) * this.rayLength,
                y: this.y - Math.cos(rayAngel) * this.rayLength,
            };
            this.rays.push({startPoint, endPoint});
        }
    }
    #getMaxPointDistance() {
        let max = -Infinity;
        for (let point of this.otherPoints) {
            if (max < this.#getDistance(this.x, this.y, point.x, point.y)) {
                max = this.#getDistance(this.x, this.y, point.x, point.y);
            }
        }
        let min = Infinity;
        for (let point of this.otherPoints) {
            if (min > this.#getDistance(this.x, this.y, point.x, point.y)) {
                min = this.#getDistance(this.x, this.y, point.x, point.y);
            }
        }
        return [max, min];
    }
    #getDistance(x, y, xp, yp) {
        return Math.sqrt(Math.pow(x - xp, 2) + Math.pow(y - yp, 2));
    }
    #checkEnd() {
        if (this.y > window.innerHeight) {
            this.y = 10;
        }
        if (this.y < 0) {
            this.y = window.innerHeight - 10;
        }
        if (this.x > window.innerWidth) {
            this.x = 10;
        }
        if (this.x < 0) {
            this.x = window.innerWidth - 10;
        }
    }
    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.fill();
        for (let ray of this.rays) {
            ctx.strokeStyle = "yellow";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(ray.startPoint.x, ray.startPoint.y);
            ctx.lineTo(ray.endPoint.x, ray.endPoint.y);
            ctx.stroke();
        }
    }
}
