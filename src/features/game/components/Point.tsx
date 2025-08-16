import Konva from 'konva';
import { Animation } from 'konva/lib/Animation';
import { forwardRef, memo, useCallback, useImperativeHandle, useRef } from 'react';
import { Circle, Group, Text } from 'react-konva';
import { EXIT_ANIMATION_MS, POINT_RADIUS_PX } from '../utils/constants';
import type { PointType } from '../utils/types';

interface PointProps {
  point: PointType;
  onClick: (id: string, label: number, anim: Animation) => void;
  disabled?: boolean;
}

export interface PointRef {
  stopAnimation: () => void;
  click: () => void;
}

const Point = forwardRef<PointRef, PointProps>(function Point({ point, onClick, disabled }, ref) {
  const pointRef = useRef<Konva.Group>(null);
  const circleRef = useRef<Konva.Circle>(null);
  const countdownRef = useRef<Konva.Text>(null);
  const labelRef = useRef<Konva.Text>(null);
  const animationRef = useRef<Konva.Animation | null>(null);

  useImperativeHandle(ref, () => ({
    stopAnimation: () => {
      if (animationRef.current) {
        animationRef.current.stop();
      }
    },
    click: () => {
      handlePointClick()
    }
  }), []);

  const handlePointClick = useCallback(() => {
    if (!pointRef.current) return;

    pointRef.current.listening(false)
    circleRef.current?.fill('red');
    countdownRef.current?.text(`${(EXIT_ANIMATION_MS / 1000).toFixed(1)}s`);
    countdownRef.current?.visible(true);
    labelRef.current?.y(-POINT_RADIUS_PX - POINT_RADIUS_PX / 3);
    const anim = new Konva.Animation((frame) => {
      if (!frame?.time) return;
      const progress = frame.time / EXIT_ANIMATION_MS;
      if (progress <= 1) {
        pointRef.current?.opacity(1 - progress);
        const remainingTime = ((EXIT_ANIMATION_MS / 1000) * (1 - progress)).toFixed(1);
        countdownRef.current?.text(`${remainingTime}s`);
      } else {
        pointRef.current?.destroy();
        countdownRef.current?.visible(false);
        labelRef.current?.y(-POINT_RADIUS_PX);
        anim.stop();
        animationRef.current = null;
      }
    }, pointRef.current.getLayer());

    animationRef.current = anim;
    anim.start()
    onClick(point.id, point.label, anim);
  }, [point.id, point.label, onClick]);

  return (
    <Group
      ref={pointRef}
      x={point.x}
      y={point.y}
      onClick={handlePointClick}
      listening={!disabled}
    >
      <Circle
        radius={POINT_RADIUS_PX}
        stroke={"red"}
        strokeWidth={2}
        perfectDrawEnabled={false}
        shadowForStrokeEnabled={false}
        ref={circleRef}
        fill={'white'}
      />
      <Text
        ref={labelRef}
        text={String(point.label)}
        fontSize={14}
        fill={"black"}
        x={-POINT_RADIUS_PX}
        y={-POINT_RADIUS_PX}
        width={POINT_RADIUS_PX * 2}
        height={POINT_RADIUS_PX * 2}
        align="center"
        verticalAlign="middle"
      />
      <Text
        ref={countdownRef}
        text=""
        fontSize={12}
        fill={"white"}
        x={-POINT_RADIUS_PX}
        y={-POINT_RADIUS_PX + POINT_RADIUS_PX / 3}
        width={POINT_RADIUS_PX * 2}
        height={POINT_RADIUS_PX * 2}
        align="center"
        verticalAlign="middle"
        visible={false}
      />
    </Group>
  );
});

export default memo(Point, (prevProps, nextProps) => {
  return prevProps.point.id === nextProps.point.id && prevProps.disabled === nextProps.disabled
})