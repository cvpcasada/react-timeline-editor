import { animate, MotionValue } from "motion";
import { useMotionValue, useMotionValueEvent } from "motion/react";
import { useLayoutEffect, useState } from "react";

export function MotionProp(prop: {
  value: number;
  maxValue: number;
  render: (value: number, motionValue: MotionValue<number>) => React.ReactNode;
}) {
  const [easedValue, setEasedValue] = useState(prop.value);

  const springVal = useMotionValue(prop.value);

  useLayoutEffect(() => {
    let animation = animate(springVal, prop.value, {
      type: "spring",
      mass: 5,
      stiffness: 200,
      damping: 60,
    });

    return () => animation.stop();
  }, [springVal, prop.value]);

  useMotionValueEvent(springVal, "change", setEasedValue);

  return prop.render(easedValue, springVal);
}
