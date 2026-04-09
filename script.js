const { Engine, Render, Runner, Bodies, Composite, Events } = Matter;

// 1. 엔진 및 렌더러 설정
const engine = Engine.create();
const render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        width: window.innerWidth > 420 ? 420 : window.innerWidth,
        height: window.innerHeight,
        wireframes: false,
        background: 'transparent'
    }
});

Render.run(render);
const runner = Runner.create();
Runner.run(runner, engine);

const width = render.options.width;
const height = render.options.height;

// 2. 바닥과 벽 (공이 안 나가게)
const ground = Bodies.rectangle(width / 2, height + 25, width, 60, { isStatic: true, render: { fillStyle: '#333' } });
const leftWall = Bodies.rectangle(-25, height / 2, 60, height, { isStatic: true });
const rightWall = Bodies.rectangle(width + 25, height / 2, 60, height, { isStatic: true });
Composite.add(engine.world, [ground, leftWall, rightWall]);

// 3. 공 데이터 (레벨별 크기와 색상)
const ballTypes = [
    { radius: 15, label: 2, color: '#FFB7B2' },
    { radius: 25, label: 4, color: '#FFDAC1' },
    { radius: 35, label: 8, color: '#E2F0CB' },
    { radius: 45, label: 16, color: '#B5EAD7' },
    { radius: 55, label: 32, color: '#C7CEEA' },
    { radius: 70, label: 64, color: '#F8BBD0' }
];

// 4. 클릭(터치) 시 공 생성
window.addEventListener('mousedown', (e) => {
    // 캔버스 내 상대 좌표 계산
    const rect = render.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    
    // 0~1단계의 작은 공만 생성되도록 설정
    const type = ballTypes[Math.floor(Math.random() * 2)]; 
    
    const ball = Bodies.circle(x, 50, type.radius, {
        label: type.label.toString(),
        restitution: 0.4, // 튕김 정도
        friction: 0.1,
        render: { fillStyle: type.color }
    });
    
    Composite.add(engine.world, ball);
});

// 5. 머지(합치기) 로직
Events.on(engine, 'collisionStart', (event) => {
    event.pairs.forEach((pair) => {
        const { bodyA, bodyB } = pair;

        // 같은 등급의 공이 부딪혔는지 확인
        if (bodyA.label === bodyB.label && bodyA.label !== "static") {
            const currentLabel = parseInt(bodyA.label);
            const nextTypeIndex = ballTypes.findIndex(t => t.label === currentLabel) + 1;

            if (nextTypeIndex < ballTypes.length) {
                const nextType = ballTypes[nextTypeIndex];
                const newX = (bodyA.position.x + bodyB.position.x) / 2;
                const newY = (bodyA.position.y + bodyB.position.y) / 2;

                // 기존 공 제거
                Composite.remove(engine.world, [bodyA, bodyB]);

                // 다음 단계 공 생성
                const newBall = Bodies.circle(newX, newY, nextType.radius, {
                    label: nextType.label.toString(),
                    render: { fillStyle: nextType.color }
                });
                
                Composite.add(engine.world, newBall);
                
                // 점수 상승
                updateScore(currentLabel * 2);
            }
        }
    });
});

function updateScore(points) {
    const scoreElement = document.getElementById('score');
    let currentScore = parseInt(scoreElement.innerText);
    scoreElement.innerText = currentScore + points;
}
// 클릭(터치) 시 공 생성
window.addEventListener('mousedown', (e) => {
    const rect = render.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    
    // 너무 위를 클릭하면 공이 안 나오게 하거나, 고정된 높이(50px)에서 투하
    const type = ballTypes[Math.floor(Math.random() * 2)]; 
    
    const ball = Bodies.circle(x, 50, type.radius, {
        label: type.label.toString(),
        restitution: 0.4,
        render: { fillStyle: type.color }
    });
    
    Composite.add(engine.world, ball);
});
