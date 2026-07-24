// Small SVG flags for the language toggle (emoji flags don't render on Android).
import { View } from "react-native";
import Svg, { Line, Rect } from "react-native-svg";

type FlagProps = { country: "gb" | "rs"; size?: number };

export function Flag({ country, size = 24 }: FlagProps) {
  const w = size;
  const h = Math.round(size * 0.7);

  return (
    <View style={{ width: w, height: h, borderRadius: 4, overflow: "hidden" }}>
      <Svg width={w} height={h} viewBox="0 0 60 30" preserveAspectRatio="none">
        {country === "gb" ? (
          <>
            <Rect width="60" height="30" fill="#012169" />
            <Line x1="0" y1="0" x2="60" y2="30" stroke="#FFFFFF" strokeWidth="6" />
            <Line x1="60" y1="0" x2="0" y2="30" stroke="#FFFFFF" strokeWidth="6" />
            <Line x1="0" y1="0" x2="60" y2="30" stroke="#C8102E" strokeWidth="2.5" />
            <Line x1="60" y1="0" x2="0" y2="30" stroke="#C8102E" strokeWidth="2.5" />
            <Rect x="25" width="10" height="30" fill="#FFFFFF" />
            <Rect y="10" width="60" height="10" fill="#FFFFFF" />
            <Rect x="27" width="6" height="30" fill="#C8102E" />
            <Rect y="12" width="60" height="6" fill="#C8102E" />
          </>
        ) : (
          <>
            <Rect y="0" width="60" height="10" fill="#C6363C" />
            <Rect y="10" width="60" height="10" fill="#0C4076" />
            <Rect y="20" width="60" height="10" fill="#FFFFFF" />
          </>
        )}
      </Svg>
    </View>
  );
}
