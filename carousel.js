/**
 * Featured Work Carousel with Interactive 3D Scatterplot
 * 
 * This carousel displays featured projects with:
 * - Two sub-panels: 2/3 for 3D scatterplot visualization, 1/3 for images
 * - Navigation buttons (left/right) positioned at bottom right
 * - Keyboard navigation support (arrow keys)
 * - Smooth slide transitions
 * 
 * Future CSV Integration:
 * The scatterplot is designed to load data from CSV files with the following structure:
 * - x, y, z: coordinates for 3D position
 * - imageUrl: URL to the image associated with each data point
 * - Users will be able to navigate the scatterplot and click points to display images
 * 
 * To add CSV loading:
 * 1. Add a CSV parser library (e.g., PapaParse)
 * 2. Load CSV data in the generateSampleData() method
 * 3. Add click handlers to points to update the image panel
 * 4. Implement image loading from the imageUrl field
 */

// Carousel functionality
class FeaturedWorkCarousel {
    constructor() {
        this.currentSlide = 0;
        this.slides = document.querySelectorAll('.carousel-slide');
        this.prevBtn = document.querySelector('.prev-btn');
        this.nextBtn = document.querySelector('.next-btn');
        this.scatterplots = {};
        this.keyboardHandler = null;
        
        this.init();
    }
    
    init() {
        // Initialize carousel navigation
        if (this.prevBtn && this.nextBtn) {
            this.prevBtn.addEventListener('click', () => this.prevSlide());
            this.nextBtn.addEventListener('click', () => this.nextSlide());
        }
        
        // Add keyboard navigation
        this.keyboardHandler = (e) => {
            if (e.key === 'ArrowLeft') {
                this.prevSlide();
            } else if (e.key === 'ArrowRight') {
                this.nextSlide();
            }
        };
        document.addEventListener('keydown', this.keyboardHandler);
        
        // Initialize 3D scatterplots for each slide
        this.initScatterplots();
    }
    
    destroy() {
        // Cleanup method to remove event listeners and stop animations
        if (this.keyboardHandler) {
            document.removeEventListener('keydown', this.keyboardHandler);
        }
        
        // Cleanup scatterplots
        Object.values(this.scatterplots).forEach(plot => {
            if (plot.animationId) {
                cancelAnimationFrame(plot.animationId);
            }
            if (plot.handleResize) {
                window.removeEventListener('resize', plot.handleResize);
            }
        });
    }
    
    nextSlide() {
        this.currentSlide = (this.currentSlide + 1) % this.slides.length;
        this.updateSlides();
    }
    
    prevSlide() {
        this.currentSlide = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
        this.updateSlides();
    }
    
    updateSlides() {
        this.slides.forEach((slide, index) => {
            if (index === this.currentSlide) {
                slide.classList.add('active');
            } else {
                slide.classList.remove('active');
            }
        });
    }
    
    initScatterplots() {
        // Initialize a 3D scatterplot for each slide
        for (let i = 1; i <= 3; i++) {
            const container = document.getElementById(`scatterplot-container-${i}`);
            if (container) {
                // Check if Three.js is available
                if (typeof THREE !== 'undefined') {
                    this.scatterplots[i] = this.createScatterplot(container, i);
                } else {
                    // Create a canvas-based placeholder for now
                    this.scatterplots[i] = this.createCanvasPlaceholder(container, i);
                }
            }
        }
    }
    
    createCanvasPlaceholder(container, slideNumber) {
        // Create a canvas element for visualization
        const canvas = document.createElement('canvas');
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        container.appendChild(canvas);
        
        const ctx = canvas.getContext('2d');
        
        // Generate sample data points
        const points = this.generateSampleData(slideNumber);
        
        // Animation state
        let rotation = 0;
        let animationId = null;
        
        // Draw function
        const draw = () => {
            // Clear canvas
            ctx.fillStyle = '#1a1a1a';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw axes
            ctx.strokeStyle = '#404040';
            ctx.lineWidth = 2;
            
            // X axis
            ctx.beginPath();
            ctx.moveTo(50, canvas.height / 2);
            ctx.lineTo(canvas.width - 50, canvas.height / 2);
            ctx.stroke();
            
            // Y axis
            ctx.beginPath();
            ctx.moveTo(canvas.width / 2, 50);
            ctx.lineTo(canvas.width / 2, canvas.height - 50);
            ctx.stroke();
            
            // Draw points with pseudo-3D effect
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const scale = 80;
            
            points.forEach((point, i) => {
                // Apply rotation
                const rotX = point.x * Math.cos(rotation) - point.z * Math.sin(rotation);
                const rotZ = point.x * Math.sin(rotation) + point.z * Math.cos(rotation);
                
                // Project to 2D
                const x = centerX + rotX * scale;
                const y = centerY - point.y * scale;
                const size = 3 + (rotZ + 2) * 1.5; // Size based on depth
                
                // Draw point
                ctx.fillStyle = `rgb(${point.color.r * 255}, ${point.color.g * 255}, ${point.color.b * 255})`;
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fill();
            });
            
            // Add text overlay
            ctx.fillStyle = '#666';
            ctx.font = '14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('3D Scatterplot Placeholder', canvas.width / 2, 30);
            ctx.fillText('(Ready for Three.js integration)', canvas.width / 2, 50);
            ctx.fillText(`${points.length} data points`, canvas.width / 2, canvas.height - 20);
            
            // Update rotation
            rotation += 0.01;
            
            // Continue animation
            animationId = requestAnimationFrame(draw);
        };
        
        // Start animation
        draw();
        
        // Handle resize
        const handleResize = () => {
            canvas.width = container.clientWidth;
            canvas.height = container.clientHeight;
        };
        window.addEventListener('resize', handleResize);
        
        return {
            canvas,
            animationId,
            handleResize
        };
    }
    
    createScatterplot(container, slideNumber) {
        // Scene setup
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x1a1a1a);
        
        // Camera setup
        const camera = new THREE.PerspectiveCamera(
            75,
            container.clientWidth / container.clientHeight,
            0.1,
            1000
        );
        camera.position.z = 5;
        
        // Renderer setup
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(container.clientWidth, container.clientHeight);
        container.appendChild(renderer.domElement);
        
        // Add ambient light
        const ambientLight = new THREE.AmbientLight(0x404040);
        scene.add(ambientLight);
        
        // Add directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(1, 1, 1);
        scene.add(directionalLight);
        
        // Create sample scatterplot data
        const points = this.generateSampleData(slideNumber);
        
        // Create point geometry
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(points.length * 3);
        const colors = new Float32Array(points.length * 3);
        
        points.forEach((point, i) => {
            positions[i * 3] = point.x;
            positions[i * 3 + 1] = point.y;
            positions[i * 3 + 2] = point.z;
            
            colors[i * 3] = point.color.r;
            colors[i * 3 + 1] = point.color.g;
            colors[i * 3 + 2] = point.color.b;
        });
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        // Create material
        const material = new THREE.PointsMaterial({
            size: 0.1,
            vertexColors: true
        });
        
        // Create points mesh
        const pointsMesh = new THREE.Points(geometry, material);
        scene.add(pointsMesh);
        
        // Add axes helper
        const axesHelper = new THREE.AxesHelper(3);
        scene.add(axesHelper);
        
        // Animation loop
        let animationId;
        const animate = () => {
            animationId = requestAnimationFrame(animate);
            
            // Rotate the point cloud
            pointsMesh.rotation.x += 0.002;
            pointsMesh.rotation.y += 0.003;
            
            renderer.render(scene, camera);
        };
        animate();
        
        // Handle window resize
        const handleResize = () => {
            if (container.clientWidth > 0 && container.clientHeight > 0) {
                camera.aspect = container.clientWidth / container.clientHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(container.clientWidth, container.clientHeight);
            }
        };
        window.addEventListener('resize', handleResize);
        
        // Mouse interaction for rotation control
        let isDragging = false;
        let previousMousePosition = { x: 0, y: 0 };
        
        container.addEventListener('mousedown', (e) => {
            isDragging = true;
            previousMousePosition = { x: e.clientX, y: e.clientY };
        });
        
        container.addEventListener('mousemove', (e) => {
            if (isDragging) {
                const deltaX = e.clientX - previousMousePosition.x;
                const deltaY = e.clientY - previousMousePosition.y;
                
                pointsMesh.rotation.y += deltaX * 0.01;
                pointsMesh.rotation.x += deltaY * 0.01;
                
                previousMousePosition = { x: e.clientX, y: e.clientY };
            }
        });
        
        container.addEventListener('mouseup', () => {
            isDragging = false;
        });
        
        container.addEventListener('mouseleave', () => {
            isDragging = false;
        });
        
        return {
            scene,
            camera,
            renderer,
            pointsMesh,
            animationId,
            handleResize
        };
    }
    
    generateSampleData(slideNumber) {
        // Generate sample 3D scatter data
        // In the future, this will load from CSV
        const points = [];
        const numPoints = 50 + slideNumber * 20;
        
        for (let i = 0; i < numPoints; i++) {
            const angle = (i / numPoints) * Math.PI * 2;
            const radius = 1 + Math.random() * 2;
            const height = (Math.random() - 0.5) * 2;
            
            points.push({
                x: Math.cos(angle) * radius + (Math.random() - 0.5) * 0.5,
                y: height,
                z: Math.sin(angle) * radius + (Math.random() - 0.5) * 0.5,
                color: {
                    r: 0.3 + Math.random() * 0.7,
                    g: 0.5 + Math.random() * 0.5,
                    b: 0.8 + Math.random() * 0.2
                },
                // Placeholder for future image URL
                imageUrl: `image-${slideNumber}-${i}.jpg`
            });
        }
        
        return points;
    }
}

// Initialize carousel when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const carousel = new FeaturedWorkCarousel();
});
