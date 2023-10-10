class Game {
    constructor(state) {
        this.state = state;
        this.spawnedObjects = [];
        this.collidableObjects = [];
        this.spawnedAliens = [];
        this.spawnedPowerUps = [];
        this.powerUp = false;
        this.bullet_count = 1;
        this.gameOver= false;
    }

    deleteObject(object){
            object.collidable = false;
            object.collider = null;
            let index = this.state.objects.indexOf(object);
            let j = this.collidableObjects.indexOf(object);
            let k = this.spawnedAliens.indexOf(object);
            let n = this.spawnedPowerUps.indexOf(object);

            
            if (j !== -1) {
                // Remove object from collidable array.
                this.collidableObjects.splice(j, 1);
            }

            if (n !== -1) {
                // Remove object from power up array.
                this.spawnedPowerUps.splice(n, 1);
            }
            
            if (k !== -1) {
                // Remove alien from spawnedAliens array
                this.spawnedAliens.splice(k,1);
            }

            if (index !== -1) {
            // Remove object from the 'objects' array.
            this.state.objects.splice(index, 1);
            }
    }

    // create a collider on our object with various fields we might need (you will likely need to add/remove/edit how this works)
     createSphereCollider(object, radius, onCollide = null) {
         object.collider = {
             type: "SPHERE",
             radius: radius,
             onCollide: onCollide ? onCollide : (otherObject) => {
                 console.log(`Collided with ${otherObject.name}`);
             }
         };
         this.collidableObjects.push(object);
     }

    // function to check if an object is colliding with collidable objects
     checkCollision(object, collisonWith) {
        // loop over all the other collidable objects 
        this.collidableObjects.forEach(otherObject => {
          if (otherObject.name.includes(collisonWith)){
            var a_vec = vec4.fromValues(otherObject.model.position[0], otherObject.model.position[1], otherObject.model.position[2], 1.0);
            var b_vec = vec4.fromValues(object.model.position[0], object.model.position[1], object.model.position[2], 1.0);
    
            var b_t = vec4.fromValues(0.0, 0.0, 0.0, 0.0);
            var a_t = vec4.fromValues(0.0, 0.0, 0.0, 0.0);
    
            vec4.transformMat4(a_t, a_vec, otherObject.model.modelMatrix);
            vec4.transformMat4(b_t, b_vec, object.model.modelMatrix);
    
            var distance = vec3.distance(b_t, a_t);
            var radius_sum = object.collider.radius + otherObject.collider.radius;

            if (distance < radius_sum){
                object.collider.onCollide(otherObject)
            }
          }
        });
     }

     spawnBullets(position){
        spawnObject({
            name: `bullet${this.bullet_count}`,
            type: "cube",
            material: {
                ambient: vec3.fromValues(0.3, 0.3, 0.3),
                diffuse: randomVec3(0, 1),
                specular: vec3.fromValues(0.5, 0.5, 0.5),
                n: 5,
                alpha: 1.0,
                shaderType: 1,
            },

            position: position, 
            scale: vec3.fromValues(0.05, 0.05, 0.05),

            diffuseTexture: "default.jpg",
            model: "9mm.obj"

        }, this.state).then(async mesh => {
            const delay = ms => new Promise(res => setTimeout(res, ms));
            this.spawnedObjects.push(mesh);
            this.createSphereCollider(mesh, 0.01, otherObject => {
              console.log(`Collided with !!!!!!!!!!!!${otherObject.name}`);
              object.translate(vec3.fromValues(0, -1, 0));
              });
            mesh.collidable = true;
            await delay(3000);
            this.deleteObject(mesh);  
          });;
        this.bullet_count++;
     }

    // runs once on startup after the scene loads the objects
    async onStart() {
        console.log("On start");

        // this just prevents the context menu from popping up when you right click
        document.addEventListener("contextmenu", (e) => {
            e.preventDefault();
        }, false);

        this.jet = getObject(this.state, "jet");
        this.earth = getObject(this.state, "earth");
        this.alien = getObject(this.state, "alien");
        
        this.canvas = document.querySelector("canvas");

        document.getElementById('PlayerHealth').innerHTML = this.jet.health;
        

        //create a collider cube for the jet
        spawnObject({
            name: 'jet_collider',
            type: "cube",
            material: {
                ambient: vec3.fromValues(0, 0, 0),
                diffuse: vec3.fromValues(0,0,0),
                specular: vec3.fromValues(0, 0, 0),
                n: 5,
                alpha: 1.0,
                shaderType: 1,
            },

            position: vec3.fromValues(this.jet.model.position[0]+0.5, this.jet.model.position[1], this.jet.model.position[2]+3),
            scale: vec3.fromValues(0.01, 0.01, 0.01),

            diffuseTexture: "default.jpg",
            parent: "jet"

        }, this.state).then(mesh => {
            this.jetCollider = mesh;
            this.createSphereCollider(mesh, 0.01, (otherObject) => {
                
                this.jet.health += -20;
                this.deleteObject(otherObject);
                
                if (this.jet.health <= 0) {
                    this.gameOver = true;
                    this.deleteObject(mesh);
                    this.deleteObject(this.jet);
                    window.location.href = "gameover.html";   
                }
                    
            });
            mesh.collidable = true; 
          });;
        

        document.addEventListener("keydown", (e) => {
            e.preventDefault();
            switch (e.code) {

                /* Dev controls
                case "ArrowLeft":
                    if (e.getModifierState("Shift")) {
                        this.state.camera.yaw += -0.1;
                    } else{
                        //this.state.camera.yaw = this.state.camera.yaw - 0.1;
                        vec3.add(this.state.camera.position, state.camera.position, vec3.fromValues(0.5, 0.0, 0.0));
                    }
                    break;

                case "ArrowRight":
                    if (e.getModifierState("Shift")) {
                        this.state.camera.yaw += 0.1;
                    } else {
                        //this.state.camera.yaw += 0.1;
                        vec3.add(this.state.camera.position, state.camera.position, vec3.fromValues(-0.5, 0.0, 0.0));
                    }
                    break;
                    
                case "ArrowUp":
                    //this.state.camera.pitch += 0.1;
                    vec3.add(this.state.camera.position, state.camera.position, vec3.fromValues(0.0, 0.5, 0.0));
                    break;
                
                case "ArrowDown":
                    //this.state.camera.pitch += -0.1;
                    vec3.add(this.state.camera.position, state.camera.position, vec3.fromValues(0.0, -0.5, 0.0));
                    break;
                case "BracketLeft":
                    vec3.add(this.state.camera.position, state.camera.position, vec3.fromValues(0.0, 0.0, 0.5));
                    break;
                
                case "BracketRight":
                    vec3.add(this.state.camera.position, state.camera.position, vec3.fromValues(0.0, 0.0, -0.5));
                    break;
                */
                
                case "ShiftRight":
                    
                    if (this.state.camera.name === "mainCamera") {
                        this.state.camera = this.state.settings.camera2;
                    } else {
                        this.state.camera = this.state.settings.camera;
                    }
                    
                case "KeyA":
                    this.jet.translate(vec3.fromValues(0.1, 0, 0));
                    this.jet.rotate('x', -0.01);
                    break;

                case "KeyD":
                    this.jet.translate(vec3.fromValues(-0.1, 0, 0));
                    this.jet.rotate('x', 0.01);
                    break;

                case "Space":
                    if (this.powerUp){
                        this.spawnBullets(vec3.fromValues(this.jet.model.position[0]+0.17, this.jet.model.position[1]-0.32, this.jet.model.position[2]-0.3));
                        this.spawnBullets(vec3.fromValues(this.jet.model.position[0]-0.09, this.jet.model.position[1]-0.32, this.jet.model.position[2]-0.3));
                    }

                    else {
                        this.spawnBullets(vec3.fromValues(this.jet.model.position[0]+0.04, this.jet.model.position[1]-0.32, this.jet.model.position[2]-0.3));
                    }
                    break;
                
                /* Unnecessary controls
                case "KeyW":
                    this.jet.translate(vec3.fromValues(0, 0, 0.5));
                    break;

                case "KeyS":
                    this.jet.translate(vec3.fromValues(0, 0, -0.5));
                    break;

                case "KeyX":
                    this.jet.translate(vec3.fromValues(0, 0.3, 0));

                    // Wait for a short period of time
                    setTimeout(() => {
                    // Move the object back down
                    this.jet.translate(vec3.fromValues(0, -0.3, 0));
                    }, 150);
                    break;
                */ 
                default:
                    break;
            }
        });
        spawnAliensWithDelay.call(this);
        spawnPowerUpsWithDelay.call(this);

        async function spawnAliensWithDelay() {
            const alienCount = 100; //100000;
            const delayBetweenSpawns = 3000; // milliseconds
        
            for (let i = 0; i < alienCount; i++) {
                await new Promise((resolve) => {
                    setTimeout(async () => {
                        let tempObject = await spawnObject( {
                            name: `alien${i}`,
                            type: "mesh",
                            material: {
                                ambient: vec3.fromValues(0.3, 0.3, 0.3),
                                diffuse: randomVec3(0, 1),
                                specular: vec3.fromValues(0.5, 0.5, 0.5),
                                n: 5,
                                alpha: 1.0,
                                shaderType: 3,
                            },

                            position: vec3.fromValues(Math.random() * 2 - 1, 0, 0),
                            scale: vec3.fromValues(0.05, 0.05, 0.05),

                            diffuseTexture: "alien.jpg",
                            model: "earth.obj"
                          }, this.state);
        
                        tempObject.constantRotate = false;
                        this.spawnedAliens.push(tempObject);
                        this.createSphereCollider(tempObject, 0.2, object => {
                          this.deleteObject(tempObject);
                          this.deleteObject(object);
                          });
                        tempObject.collidable = true;
                        resolve();
                        const delay = ms => new Promise(res => setTimeout(res, ms));
                        await delay(15000);
                        this.deleteObject(tempObject); 
                    }, delayBetweenSpawns);
                });
            }
        }

        async function spawnPowerUpsWithDelay() {
            const powerUpCount = 10;
            const delayBetweenSpawns = 10000; // milliseconds
        
            for (let i = 0; i < powerUpCount; i++) {
                await new Promise((resolve) => {
                    setTimeout(async () => {
                        let powerUp = await spawnObject( {
                            name: `powerUp${i}`,
                            type: "cube",
                            material: {
                                ambient: vec3.fromValues(0.3, 0.3, 0.3),
                                diffuse: randomVec3(0, 1),
                                specular: vec3.fromValues(0.5, 0.5, 0.5),
                                n: 5,
                                alpha: 1.0,
                                shaderType: 3,
                            },

                            position: vec3.fromValues(Math.random() * 2 - 1, -0.3, 0),
                            scale: vec3.fromValues(0.2, 0.2, 0.2),

                            diffuseTexture: "apple.jpg",
                          }, this.state);
        
                        powerUp.constantRotate = false;
                        this.spawnedPowerUps.push(powerUp);
                        this.createSphereCollider(powerUp, 0.1, object => {
                          console.log("Power Up!!!!!")
                          this.powerUp = true;
                          this.deleteObject(powerUp);
                          setTimeout(() => {
                            this.powerUp = false;
                          }, 8000);
                          });
                        powerUp.collidable = true;
                        resolve();
                        const delay = ms => new Promise(res => setTimeout(res, ms));
                        await delay(10000);
                        this.deleteObject(powerUp); 
                    }, delayBetweenSpawns);
                });
            }
        }
}

    // Runs once every frame non stop after the scene loads
    onUpdate(deltaTime) {

        document.getElementById('PlayerHealth').innerHTML = this.jet.health;

        //rotate earth
        this.earth.rotate('x', deltaTime * -0.1);

        // shoot the bullets forward
        this.spawnedObjects.forEach((object) => {
            object.translate(vec3.fromValues(0, 0, 0.05));
        });
        this.spawnedAliens.forEach((object) => {
            object.translate(vec3.fromValues(0, 0, -0.03));
            this.checkCollision(object, "bullet");
        });

        this.spawnedPowerUps.forEach((object) => {
            object.translate(vec3.fromValues(0, 0, -0.03));
            this.checkCollision(object, "bullet")
        });

        this.checkCollision(this.jetCollider, "alien");

    }
    
    handleJetAlienCollision(jet, alien) {
        this.state.gl.clearColor(0.0, 0.0, 0.0, 1.0); // Set the WebGL context clear color to black
        this.deleteObject(alien); // Remove the alien from the game
    }
}
