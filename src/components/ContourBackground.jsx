import { useEffect, useRef, useState } from 'react'

const vertexShaderSource = `
attribute vec2 a_position;
varying vec2 v_uv;

void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`

const fragmentShaderSource = `
precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_pointer;
uniform float u_motion;
varying vec2 v_uv;

float hash(vec2 point) {
  return fract(sin(dot(point, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 point) {
  vec2 cell = floor(point);
  vec2 local = fract(point);
  local = local * local * (3.0 - 2.0 * local);
  float bottom = mix(hash(cell), hash(cell + vec2(1.0, 0.0)), local.x);
  float top = mix(hash(cell + vec2(0.0, 1.0)), hash(cell + vec2(1.0, 1.0)), local.x);
  return mix(bottom, top, local.y);
}

float fbm(vec2 point) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int octave = 0; octave < 3; octave += 1) {
    value += noise(point) * amplitude;
    point = point * 2.02 + vec2(17.3, 9.1);
    amplitude *= 0.5;
  }
  return value;
}

void main() {
  vec2 uv = v_uv - 0.5;
  uv.x *= u_resolution.x / u_resolution.y;
  float time = u_time * 0.018 * u_motion;

  vec2 pointer = u_pointer - 0.5;
  pointer.x *= u_resolution.x / u_resolution.y;
  float pointerInfluence = exp(-dot(uv - pointer * 0.72, uv - pointer * 0.72) * 4.0);

  vec2 warped = uv;
  warped += 0.22 * vec2(
    fbm(uv * 1.2 + vec2(time * 0.75, -time * 0.5)) - 0.5,
    fbm(uv * 1.2 + vec2(-time * 0.45, time * 0.65) + 6.4) - 0.5
  );
  warped += pointerInfluence * pointer * 0.035 * u_motion;

  float field = fbm(warped * 1.45 + vec2(time * 0.42, -time * 0.3));
  field += fbm(warped * 2.35 + vec2(-time * 0.22, time * 0.28) + 3.7) * 0.2;
  field /= 1.2;

  float distanceToContour = abs(fract(field * 5.2) - 0.5);
  float contour = 1.0 - smoothstep(0.0, 0.022, distanceToContour);
  vec3 background = vec3(0.953, 0.941, 0.914);
  vec3 lineColor = vec3(0.31, 0.51, 0.59);
  vec3 color = mix(background, lineColor, contour * 0.2);

  gl_FragColor = vec4(color, 1.0);
}
`

function compileShader(gl, type, source) {
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader)
    return null
  }
  return shader
}

const contourGroups = [
  {
    className: 'contour-field--north',
    duration: 42,
    paths: [
      {
        d: 'M -180 218 C -38 72 166 38 354 88 C 522 132 613 84 756 42 C 930 -10 1110 44 1194 162 C 1274 274 1184 380 1022 375 C 858 370 775 303 640 350 C 496 400 390 492 220 442 C 55 393 -118 327 -180 218 Z',
        morph: 'M -180 228 C -20 54 174 48 362 104 C 528 154 626 70 770 58 C 946 42 1126 58 1208 180 C 1282 290 1164 386 1010 356 C 846 324 768 326 628 364 C 472 406 382 468 208 430 C 28 390 -126 332 -180 228 Z',
      },
      {
        d: 'M -122 222 C 18 104 178 84 344 126 C 500 166 604 128 744 96 C 894 62 1054 88 1132 184 C 1200 270 1118 330 1004 326 C 852 322 766 282 628 328 C 480 378 390 442 234 404 C 86 370 -76 314 -122 222 Z',
        morph: 'M -122 228 C 20 88 190 98 354 142 C 506 184 620 110 754 112 C 910 114 1070 90 1148 192 C 1204 268 1106 342 986 310 C 840 270 758 302 620 340 C 470 382 378 422 228 392 C 82 362 -74 316 -122 228 Z',
      },
      {
        d: 'M -62 226 C 72 132 204 126 334 158 C 470 192 584 170 730 140 C 868 112 1000 130 1064 202 C 1118 262 1054 290 968 286 C 832 280 750 266 618 308 C 478 352 382 394 252 370 C 126 346 -12 294 -62 226 Z',
        morph: 'M -62 230 C 80 122 210 142 344 170 C 480 198 596 150 736 154 C 878 158 1018 124 1076 210 C 1120 276 1038 298 952 270 C 824 228 738 286 610 320 C 468 356 372 378 248 356 C 114 332 -8 292 -62 230 Z',
      },
      {
        d: 'M 2 232 C 118 168 222 164 330 184 C 450 206 572 204 714 178 C 842 154 944 166 994 216 C 1028 250 980 260 916 250 C 806 232 730 276 602 306 C 474 336 384 348 270 326 C 160 306 76 274 2 232 Z',
        morph: 'M 2 236 C 124 156 238 176 338 194 C 462 216 580 190 720 192 C 848 194 958 154 1006 222 C 1034 262 968 264 902 238 C 798 198 714 278 594 312 C 464 348 376 332 264 316 C 152 300 72 270 2 236 Z',
      },
    ],
  },
  {
    className: 'contour-field--south',
    duration: 49,
    paths: [
      {
        d: 'M 372 730 C 428 566 586 454 758 474 C 920 492 960 610 1096 640 C 1236 670 1390 606 1530 700 C 1670 794 1660 1004 1494 1086 C 1340 1160 1194 1046 1048 1094 C 896 1144 796 1218 650 1128 C 522 1048 592 902 486 834 C 414 790 354 784 372 730 Z',
        morph: 'M 390 742 C 414 584 600 436 772 496 C 936 554 946 620 1084 662 C 1232 708 1378 590 1522 716 C 1656 834 1626 1016 1470 1080 C 1324 1140 1182 1034 1032 1108 C 884 1180 770 1190 636 1120 C 506 1052 610 906 500 826 C 430 776 376 796 390 742 Z',
      },
      {
        d: 'M 430 738 C 482 604 604 508 752 520 C 898 532 956 644 1084 676 C 1218 710 1360 650 1486 730 C 1608 808 1588 966 1456 1026 C 1326 1084 1190 984 1042 1042 C 892 1100 806 1144 678 1078 C 568 1022 644 900 532 822 C 470 780 412 784 430 738 Z',
        morph: 'M 446 746 C 472 612 626 478 764 548 C 900 616 944 666 1078 700 C 1210 734 1340 624 1478 748 C 1588 846 1556 956 1428 1002 C 1300 1048 1182 972 1038 1060 C 900 1142 790 1110 670 1064 C 558 1020 664 884 548 806 C 482 760 430 780 446 746 Z',
      },
      {
        d: 'M 492 748 C 538 636 644 554 748 564 C 874 576 944 678 1074 712 C 1204 746 1320 696 1434 758 C 1530 812 1518 920 1408 960 C 1290 1002 1180 916 1044 978 C 912 1038 808 1068 704 1016 C 616 972 674 874 576 810 C 526 778 478 780 492 748 Z',
        morph: 'M 506 756 C 528 644 668 530 766 590 C 874 656 934 706 1068 734 C 1204 762 1300 670 1428 780 C 1512 852 1482 906 1390 934 C 1278 968 1180 900 1040 994 C 916 1076 804 1030 698 1000 C 600 972 700 858 584 792 C 536 764 494 782 506 756 Z',
      },
      {
        d: 'M 558 756 C 600 668 680 604 752 608 C 858 614 930 714 1060 744 C 1188 774 1280 730 1376 784 C 1444 822 1442 884 1360 906 C 1260 934 1176 860 1048 930 C 932 994 826 1006 734 966 C 658 934 704 862 616 810 C 580 788 548 780 558 756 Z',
        morph: 'M 570 764 C 594 674 698 584 770 628 C 862 684 918 738 1054 764 C 1186 790 1262 708 1370 808 C 1428 862 1400 878 1342 886 C 1248 900 1170 850 1046 944 C 934 1028 822 974 730 948 C 644 924 722 842 620 792 C 590 778 560 784 570 764 Z',
      },
    ],
  },
  {
    className: 'contour-field--center',
    duration: 56,
    paths: [
      {
        d: 'M 1120 298 C 1234 236 1370 280 1410 382 C 1448 480 1392 552 1480 620 C 1562 684 1680 670 1724 774 C 1770 884 1676 996 1544 946 C 1410 896 1368 786 1256 764 C 1146 742 1052 786 986 700 C 922 612 974 382 1120 298 Z',
        morph: 'M 1132 314 C 1246 218 1380 308 1400 402 C 1420 500 1378 568 1472 638 C 1556 700 1688 640 1732 780 C 1770 900 1650 970 1532 920 C 1404 866 1374 774 1250 748 C 1134 724 1066 812 982 704 C 918 620 984 390 1132 314 Z',
      },
      {
        d: 'M 1144 350 C 1238 294 1340 322 1372 402 C 1404 484 1356 558 1440 638 C 1516 710 1628 704 1662 786 C 1694 866 1620 930 1548 884 C 1442 818 1382 740 1250 718 C 1140 700 1074 748 1028 674 C 976 590 1028 416 1144 350 Z',
        morph: 'M 1154 366 C 1248 276 1350 350 1362 420 C 1376 506 1342 570 1424 650 C 1500 724 1628 684 1666 800 C 1688 866 1600 910 1536 862 C 1444 796 1376 730 1244 704 C 1136 684 1086 766 1022 674 C 980 614 1044 434 1154 366 Z',
      },
      {
        d: 'M 1172 408 C 1250 358 1316 374 1340 432 C 1368 496 1322 570 1400 660 C 1464 734 1570 744 1598 802 C 1624 854 1580 884 1536 850 C 1452 784 1372 704 1246 680 C 1142 660 1108 716 1068 658 C 1030 604 1084 464 1172 408 Z',
        morph: 'M 1180 420 C 1254 340 1326 396 1332 446 C 1342 516 1308 582 1384 672 C 1450 750 1556 728 1602 820 C 1620 854 1568 870 1522 830 C 1448 766 1368 698 1240 670 C 1138 648 1118 732 1062 658 C 1038 622 1094 480 1180 420 Z',
      },
      {
        d: 'M 1202 468 C 1260 424 1300 432 1318 470 C 1340 518 1300 584 1364 684 C 1422 772 1514 780 1548 824 C 1500 786 1434 694 1240 648 C 1146 626 1140 686 1108 646 C 1086 616 1128 520 1202 468 Z',
        morph: 'M 1210 480 C 1262 408 1308 448 1310 486 C 1318 538 1288 596 1350 694 C 1408 784 1498 770 1550 844 C 1492 806 1428 688 1234 638 C 1140 614 1148 700 1100 644 C 1080 620 1140 526 1210 480 Z',
      },
    ],
  },
]

function prefersReducedMotion() {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false
}

export default function ContourBackground() {
  const canvasRef = useRef(null)
  const [motionEnabled, setMotionEnabled] = useState(() => !prefersReducedMotion())
  const [webglFailed, setWebglFailed] = useState(false)

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return undefined
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const updateMotionPreference = () => setMotionEnabled(!mediaQuery.matches)
    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', updateMotionPreference)
      return () => mediaQuery.removeEventListener('change', updateMotionPreference)
    }
    if (typeof mediaQuery.addListener !== 'function') return undefined
    mediaQuery.addListener(updateMotionPreference)
    return () => mediaQuery.removeListener(updateMotionPreference)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined
    const gl = canvas.getContext('webgl', {
      alpha: false,
      antialias: false,
      powerPreference: 'low-power',
    })
    if (!gl) {
      setWebglFailed(true)
      return undefined
    }

    const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource)
    const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource)
    if (!vertexShader || !fragmentShader) {
      setWebglFailed(true)
      return undefined
    }

    const program = gl.createProgram()
    if (!program) {
      setWebglFailed(true)
      return undefined
    }
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      setWebglFailed(true)
      return undefined
    }

    const buffer = gl.createBuffer()
    const position = gl.getAttribLocation(program, 'a_position')
    const resolution = gl.getUniformLocation(program, 'u_resolution')
    const time = gl.getUniformLocation(program, 'u_time')
    const pointer = gl.getUniformLocation(program, 'u_pointer')
    const motion = gl.getUniformLocation(program, 'u_motion')
    if (!buffer || position < 0 || !resolution || !time || !pointer || !motion) {
      setWebglFailed(true)
      return undefined
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    )
    gl.useProgram(program)
    gl.enableVertexAttribArray(position)
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)

    const targetPointer = { x: 0.5, y: 0.5 }
    const currentPointer = { x: 0.5, y: 0.5 }
    const resize = () => {
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5)
      canvas.width = Math.floor(window.innerWidth * pixelRatio)
      canvas.height = Math.floor(window.innerHeight * pixelRatio)
      gl.viewport(0, 0, canvas.width, canvas.height)
    }
    const updatePointer = (event) => {
      targetPointer.x = event.clientX / window.innerWidth
      targetPointer.y = 1 - event.clientY / window.innerHeight
    }
    const startTime = performance.now()
    let frame = 0
    const render = (now) => {
      currentPointer.x += (targetPointer.x - currentPointer.x) * 0.035
      currentPointer.y += (targetPointer.y - currentPointer.y) * 0.035
      gl.uniform2f(resolution, canvas.width, canvas.height)
      gl.uniform1f(time, (now - startTime) / 1000)
      gl.uniform2f(pointer, currentPointer.x, currentPointer.y)
      gl.uniform1f(motion, motionEnabled ? 1 : 0)
      gl.drawArrays(gl.TRIANGLES, 0, 6)
      if (motionEnabled) frame = requestAnimationFrame(render)
    }

    resize()
    window.addEventListener('resize', resize)
    window.addEventListener('pointermove', updatePointer, { passive: true })
    setWebglFailed(false)
    render(performance.now())

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', updatePointer)
      gl.deleteBuffer(buffer)
      gl.deleteProgram(program)
      gl.deleteShader(vertexShader)
      gl.deleteShader(fragmentShader)
    }
  }, [motionEnabled])

  return (
    <>
      <canvas ref={canvasRef} className="contour-background contour-background--canvas" aria-hidden="true" />
      <svg
        className={`contour-background contour-background--fallback${webglFailed ? ' is-visible' : ''}`}
      viewBox="0 0 1600 1100"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <g className="contour-background__fields">
        {contourGroups.map((group) => (
          <g className={`contour-field ${group.className}`} key={group.className}>
            {group.paths.map((path, index) => (
              <path d={path.d} key={`${group.className}-${index}`}>
                {motionEnabled && (
                  <animate
                    attributeName="d"
                    dur={`${group.duration + index * 2}s`}
                    values={`${path.d};${path.morph};${path.d}`}
                    keyTimes="0;0.5;1"
                    keySplines="0.42 0 0.58 1;0.42 0 0.58 1"
                    calcMode="spline"
                    repeatCount="indefinite"
                  />
                )}
              </path>
            ))}
          </g>
        ))}
      </g>
      </svg>
    </>
  )
}
