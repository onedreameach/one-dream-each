/* ==========================================================================
   ONE DREAM EACH — CINEMATIC 3D MUG
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('mug-canvas-container');
    if (!container) return;

    // 1. SCENE SETUP
    const scene = new THREE.Scene();
    
    // Camera
    const isMobile = window.innerWidth < 768;
    const camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.1, 100);
    // Initial camera position for Moment 1
    const baseCamZ = isMobile ? 13 : 9;
    camera.position.set(0, 0, baseCamZ);
    
    // Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    // Tweak output for physical materials
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    container.appendChild(renderer.domElement);

    // 2. CINEMATIC LIGHTING
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1.2);
    mainLight.position.set(5, 10, 7);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 1024;
    mainLight.shadow.mapSize.height = 1024;
    mainLight.shadow.bias = -0.001;
    scene.add(mainLight);

    // Soft atmospheric fill lights
    const fillLight = new THREE.PointLight(0x8B5CF6, 0.6, 20); // Violet
    fillLight.position.set(-5, 2, -5);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight(0x22D3EE, 0.8, 20); // Cyan
    rimLight.position.set(3, -2, -4);
    scene.add(rimLight);

    // 3. SHADOW CATCHER FLOOR
    const floorGeo = new THREE.PlaneGeometry(100, 100);
    const floorMat = new THREE.ShadowMaterial({ opacity: 0.15 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.1; // Just below the mug
    floor.receiveShadow = true;
    scene.add(floor);

    // 4. REALISTIC CERAMIC MUG CONSTRUCTION
    const mugGroup = new THREE.Group();
    scene.add(mugGroup);

    // A. Lathe Profile for Mug Body (highly realistic wall thickness and curved rim/base)
    const points = [];
    points.push(new THREE.Vector2(0, 0));             // bottom center
    points.push(new THREE.Vector2(0.8, 0));           // bottom outer start curve
    points.push(new THREE.Vector2(0.9, 0.1));         // bottom outer curve end
    points.push(new THREE.Vector2(1.0, 0.4));         // main outer wall start
    points.push(new THREE.Vector2(1.0, 2.0));         // main outer wall top
    points.push(new THREE.Vector2(0.96, 2.12));       // top rim outer curve
    points.push(new THREE.Vector2(0.9, 2.12));        // top rim inner curve
    points.push(new THREE.Vector2(0.85, 2.0));        // main inner wall top
    points.push(new THREE.Vector2(0.85, 0.15));       // main inner wall bottom
    points.push(new THREE.Vector2(0.7, 0.1));         // inner floor curve
    points.push(new THREE.Vector2(0, 0.1));           // inner floor center

    const mugGeo = new THREE.LatheGeometry(points, 64);
    // Center it vertically (approx 2.12 height, so down ~1.06)
    mugGeo.translate(0, -1.06, 0);
    mugGeo.computeVertexNormals();

    // Physical Material for premium glazed ceramic
    const ceramicMat = new THREE.MeshPhysicalMaterial({
        color: 0xf5f5f7,
        roughness: 0.1,
        metalness: 0.02,
        clearcoat: 0.7,
        clearcoatRoughness: 0.15,
        side: THREE.DoubleSide
    });

    const mugBody = new THREE.Mesh(mugGeo, ceramicMat);
    mugBody.castShadow = true;
    mugBody.receiveShadow = true;
    mugGroup.add(mugBody);

    // B. Handle
    const handleGeo = new THREE.TorusGeometry(0.65, 0.14, 32, 64, Math.PI);
    const handleMesh = new THREE.Mesh(handleGeo, ceramicMat);
    handleMesh.rotation.z = -Math.PI / 2;
    handleMesh.position.set(0.95, 0.05, 0); 
    // Scale to make it slightly elliptical (ear-shaped) instead of perfectly circular
    handleMesh.scale.set(0.8, 1.15, 0.8);
    handleMesh.castShadow = true;
    mugGroup.add(handleMesh);

    // C. Logo Decal - High Resolution Canvas generation for perfect crisp print
    const img = new Image();
    img.src = '/onedreameach-orbit-logo.png';
    img.onload = () => {
        const cvs = document.createElement('canvas');
        cvs.width = 4096; // Massive resolution for crispness
        cvs.height = 2048; // 2:1 ratio for cylindrical wrapping
        const ctx = cvs.getContext('2d');
        
        ctx.clearRect(0, 0, cvs.width, cvs.height);
        
        // Size the logo perfectly for the front face
        const targetWidth = 1200; 
        const targetHeight = img.height * (targetWidth / img.width);
        
        // Center it horizontally, position vertically on the upper half
        const x = (cvs.width - targetWidth) / 2;
        const y = (cvs.height - targetHeight) / 2 - 200;
        
        ctx.drawImage(img, x, y, targetWidth, targetHeight);
        
        // Make the print pure dark grey/black for premium contrast
        ctx.globalCompositeOperation = 'source-in';
        ctx.fillStyle = '#111115';
        ctx.fillRect(0, 0, cvs.width, cvs.height);

        const canvasTexture = new THREE.CanvasTexture(cvs);
        canvasTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
        canvasTexture.encoding = THREE.sRGBEncoding;

        const decalMat = new THREE.MeshPhysicalMaterial({
            map: canvasTexture,
            transparent: true,
            roughness: 0.1,
            metalness: 0.0,
            clearcoat: 0.5,
            clearcoatRoughness: 0.2,
            side: THREE.FrontSide,
            depthWrite: false, // Prevents z-fighting
            alphaTest: 0.05
        });

        const decalGeo = new THREE.CylinderGeometry(1.002, 1.002, 1.6, 64, 1, true);
        const decalMesh = new THREE.Mesh(decalGeo, decalMat);
        decalMesh.rotation.y = -Math.PI / 2; // Face front
        mugGroup.add(decalMesh);
    };

    // Initial mug orientation
    mugGroup.rotation.y = -0.4;
    mugGroup.rotation.x = 0.15; // Slight tilt down

    // 5. SCROLL-DRIVEN CINEMATOGRAPHY
    let targetX = 0;
    let targetY = 0;
    let targetCamZ = baseCamZ;
    let scrollRotationY = 0; // Additional rotation from scrolling

    // Helper for linear interpolation
    const lerp = (start, end, amt) => (1 - amt) * start + amt * end;
    // Helper for easeInOutCubic
    const easeInOut = t => t < .5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;

    window.addEventListener('scroll', () => {
        // Calculate scroll progress [0, 1]
        const scrollMax = document.body.scrollHeight - window.innerHeight;
        const rawProgress = scrollMax > 0 ? window.scrollY / scrollMax : 0;
        const progress = Math.max(0, Math.min(1, rawProgress));

        if (progress < 0.33) {
            // MOMENT 1 -> 2: Reveal -> The Idea
            const p = easeInOut(progress / 0.33);
            targetX = isMobile ? 0 : lerp(0, 2.5, p); 
            targetY = isMobile ? lerp(0.5, 1.2, p) : lerp(0, 0.2, p);
            targetCamZ = baseCamZ;
            scrollRotationY = lerp(0, Math.PI * 0.5, p);
        } 
        else if (progress < 0.66) {
            // MOMENT 2 -> 3: The Idea -> Details (Zoom in)
            const p = easeInOut((progress - 0.33) / 0.33);
            targetX = isMobile ? 0 : lerp(2.5, 0, p);
            targetY = isMobile ? lerp(1.2, 0, p) : lerp(0.2, -0.4, p);
            targetCamZ = lerp(baseCamZ, isMobile ? 8 : 5, p); // Zoom in
            scrollRotationY = lerp(Math.PI * 0.5, Math.PI * 1.5, p);
        } 
        else {
            // MOMENT 3 -> 4: Details -> Closing
            const p = easeInOut((progress - 0.66) / 0.34);
            targetX = 0;
            targetY = isMobile ? lerp(0, 0.5, p) : lerp(-0.4, 0, p);
            targetCamZ = lerp(isMobile ? 8 : 5, baseCamZ, p); // Zoom out
            scrollRotationY = lerp(Math.PI * 1.5, Math.PI * 2, p);
        }
    });

    // 6. INTERACTION & INERTIA
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let dragVelocityY = -0.002; // Initial idle rotation speed
    const baseIdleSpeed = -0.001;
    let userInteracted = false;
    let interactionTimeout = null;

    const startDrag = (x, y) => {
        isDragging = true;
        userInteracted = true;
        clearTimeout(interactionTimeout);
        previousMousePosition = { x, y };
        document.body.style.cursor = 'grabbing';
    };

    const doDrag = (x, y) => {
        if (!isDragging) return;
        const deltaMove = {
            x: x - previousMousePosition.x,
            y: y - previousMousePosition.y
        };

        const rotationFactor = 0.006;
        dragVelocityY = deltaMove.x * rotationFactor;
        
        // Apply vertical tilt limit
        mugGroup.rotation.x += deltaMove.y * rotationFactor * 0.5;
        mugGroup.rotation.x = Math.max(0.0, Math.min(0.4, mugGroup.rotation.x));

        previousMousePosition = { x, y };
    };

    const stopDrag = () => {
        isDragging = false;
        document.body.style.cursor = 'default';
        interactionTimeout = setTimeout(() => {
            userInteracted = false;
        }, 1500); // Resume idle spin faster
    };

    // Events
    container.addEventListener('pointerdown', (e) => startDrag(e.clientX, e.clientY));
    window.addEventListener('pointermove', (e) => doDrag(e.clientX, e.clientY));
    window.addEventListener('pointerup', stopDrag);
    window.addEventListener('pointerleave', stopDrag);
    
    // Prevent default only on horizontal moves if desired, but native pan-y handles it.
    container.addEventListener('touchstart', (e) => { startDrag(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });
    container.addEventListener('touchmove', (e) => { doDrag(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });
    container.addEventListener('touchend', stopDrag);

    // 7. ANIMATION LOOP
    const clock = new THREE.Clock();
    let currentX = 0;
    let currentY = 0;
    let currentCamZ = baseCamZ;
    let currentScrollRot = 0;
    let baseMugRotation = -0.4;

    function animate() {
        requestAnimationFrame(animate);
        const elapsedTime = clock.getElapsedTime();

        // A. Smoothly interpolate cinematic positions (Scroll based)
        currentX += (targetX - currentX) * 0.05;
        currentY += (targetY - currentY) * 0.05;
        currentCamZ += (targetCamZ - currentCamZ) * 0.05;
        currentScrollRot += (scrollRotationY - currentScrollRot) * 0.05;
        
        mugGroup.position.x = currentX;
        // Add subtle floating effect to Y
        mugGroup.position.y = currentY + Math.sin(elapsedTime * 1.5) * 0.03;
        camera.position.z = currentCamZ;

        // B. Handle User Drag Rotation + Idle Spin
        if (isDragging) {
            baseMugRotation += dragVelocityY;
        } else {
            if (userInteracted) {
                // Inertia damping
                dragVelocityY *= 0.94;
                baseMugRotation += dragVelocityY;
            } else {
                // Smoothly return to slow idle speed
                dragVelocityY = dragVelocityY * 0.95 + baseIdleSpeed * 0.05;
                baseMugRotation += dragVelocityY;
                // Return tilt to normal
                mugGroup.rotation.x += (0.15 - mugGroup.rotation.x) * 0.02;
            }
        }

        // Combine base rotation with scroll-driven rotation
        mugGroup.rotation.y = baseMugRotation + currentScrollRot;

        renderer.render(scene, camera);
    }

    // 8. RESIZE HANDLING
    window.addEventListener('resize', () => {
        const isMob = window.innerWidth < 768;
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Start
    animate();
});
