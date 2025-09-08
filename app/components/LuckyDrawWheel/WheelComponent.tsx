'use client';

import { useState, useRef, useEffect } from 'react';
import { ArrowBigDown } from 'lucide-react';

interface WheelSegment {
  id: number;
  text: string;
  color: string;
  probability?: number; // Optional probability weighting
  isReward?: boolean;   // Whether this segment represents a reward or "try again"
  rewardValue?: string; // Optional value of the reward (e.g. "$10", "Gift Card")
  image?: string;       // Optional image URL for the reward
}

interface WheelComponentProps {
  segments: WheelSegment[];
  segColors?: string[];
  winningSegment?: number | null;
  onFinished: (segment: WheelSegment) => void;
  primaryColor?: string;
  contrastColor?: string;
  buttonText?: string;
  isOnlyOnce?: boolean;
  size?: number;
  upDuration?: number;
  downDuration?: number;
  fontFamily?: string;
  spinning?: boolean;
  setSpinning?: (spinning: boolean) => void;
}

const WheelComponent = ({
  segments,
  segColors,
  winningSegment = null,
  onFinished,
  primaryColor = "#007acc",
  contrastColor = "#ffffff",
  buttonText = "SPIN",
  isOnlyOnce = false,
  size = 290,
  upDuration = 100,
  downDuration = 1000,
  fontFamily = 'Geist, sans-serif',
  spinning,
  setSpinning
}: WheelComponentProps) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinAngle, setSpinAngle] = useState(0);
  const [hasSpun, setHasSpun] = useState(false);
  const wheelRef = useRef<SVGGElement>(null);
  
  const controllable = typeof spinning === 'boolean' && typeof setSpinning === 'function';
  
  // Use the controlled state if provided, otherwise use internal state
  const spinningState = controllable ? spinning : isSpinning;
  const setSpinningState = controllable ? setSpinning : setIsSpinning;
  
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size / 2 - 10;
  
  const colors = segColors || [
    "#f44336", "#e91e63", "#9c27b0", "#673ab7", 
    "#3f51b5", "#2196f3", "#03a9f4", "#00bcd4", 
    "#009688", "#4caf50", "#8bc34a", "#cddc39", 
    "#ffeb3b", "#ffc107", "#ff9800", "#ff5722"
  ];

  // Add safety check for empty segments
  useEffect(() => {
    if (!segments || segments.length === 0) {
      console.error('No segments provided to WheelComponent');
    }
  }, [segments]);

  const spin = () => {
    // Safety check for segments
    if (!segments || segments.length === 0) {
      console.error('Cannot spin: No segments provided');
      return;
    }
    
    if (spinningState || (isOnlyOnce && hasSpun)) return;

    setSpinningState(true);
    setHasSpun(true);

    const totalRotation = 360 * 5; // 5 full rotations for effect
    
    // If no winning segment, choose randomly
    let segmentToLandOn = winningSegment;
    if (segmentToLandOn === null) {
      // Calculate landing based on probabilities if available
      const segmentProbabilities = segments.map(seg => seg.probability || 1);
      const totalProbability = segmentProbabilities.reduce((sum, prob) => sum + prob, 0);
      
      let randomValue = Math.random() * totalProbability;
      let cumulativeProbability = 0;
      
      for (let i = 0; i < segments.length; i++) {
        cumulativeProbability += segmentProbabilities[i];
        if (randomValue <= cumulativeProbability) {
          segmentToLandOn = i;
          break;
        }
      }
    }
    
    // Calculate target angle to land on the winning segment
    const arc = 360 / segments.length;
    const targetAngle = (segmentToLandOn as number) * arc;
    
    // Add extra rotation and randomness within segment
    const landingAngle = 360 - targetAngle + Math.random() * (arc * 0.8); 
    const totalAngleRad = ((totalRotation + landingAngle)); // No need to convert to radians for CSS rotation

    let currentAngle = 0;
    const maxAngle = totalAngleRad;
    const startTime = performance.now();
    
    // Animation timing constants
    const totalDuration = upDuration + downDuration;
    
    const animateRotation = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / totalDuration, 1);
      
      if (progress < 1) {
        // Easing function for acceleration and deceleration
        let easeProgress;
        if (progress < upDuration / totalDuration) {
          // Accelerate 
          easeProgress = Math.pow(progress * totalDuration / upDuration, 2) * (upDuration / totalDuration);
        } else {
          // Decelerate with cubic ease-out
          const decProgress = (progress - upDuration / totalDuration) * totalDuration / downDuration;
          easeProgress = (upDuration / totalDuration) + (1 - Math.pow(1 - decProgress, 3)) * (downDuration / totalDuration);
        }
        
        currentAngle = easeProgress * maxAngle;
        setSpinAngle(currentAngle);
        requestAnimationFrame(animateRotation);
      } else {
        // Animation completed
        setSpinAngle(maxAngle);
        setSpinningState(false);
        // Return the result
        const winningIndex = segmentToLandOn as number;
        
        // Add safety check before calling onFinished
        if (winningIndex >= 0 && winningIndex < segments.length) {
          onFinished(segments[winningIndex]);
        } else {
          console.error('Invalid winning segment index:', winningIndex);
          // If invalid, pick the first segment as fallback
          onFinished(segments[0]);
        }
      }
    };
    
    requestAnimationFrame(animateRotation);
  };

  // Calculate SVG paths and text positions for the wheel segments
  const getSegmentPath = (index: number, total: number): string => {
    if (total <= 0) return '';  // Safety check
    
    const angle = 360 / total;
    const startAngle = index * angle;
    const endAngle = (index + 1) * angle;
    
    // Convert angles to radians for the SVG path calculation
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    
    // Calculate points for the arc
    const x1 = centerX + radius * Math.cos(startRad);
    const y1 = centerY + radius * Math.sin(startRad);
    const x2 = centerX + radius * Math.cos(endRad);
    const y2 = centerY + radius * Math.sin(endRad);
    
    // Determine if the arc should be drawn as a large arc
    const largeArcFlag = angle > 180 ? 1 : 0;
    
    // Create SVG path
    return `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
  };
  
  // Calculate text position for a segment
  const getTextPosition = (index: number, total: number) => {
    if (total <= 0) {  // Safety check
      return { x: centerX, y: centerY, rotation: 0 };
    }
    
    const angle = 360 / total;
    const midAngle = index * angle + angle / 2;
    const midAngleRad = (midAngle * Math.PI) / 180;
    
    // Position text slightly inside the outer edge of the wheel
    const textRadius = radius * 0.7;
    const x = centerX + textRadius * Math.cos(midAngleRad);
    const y = centerY + textRadius * Math.sin(midAngleRad);
    
    return { x, y, rotation: midAngle };
  };

  // Calculate image position for a segment
  const getImagePosition = (index: number, total: number) => {
    if (total <= 0) {  // Safety check
      return { x: centerX, y: centerY, rotation: 0 };
    }
    
    const angle = 360 / total;
    const midAngle = index * angle + angle / 2;
    const midAngleRad = (midAngle * Math.PI) / 180;
    
    // Position image halfway between center and text
    const imageRadius = radius * 0.4;
    const x = centerX + imageRadius * Math.cos(midAngleRad);
    const y = centerY + imageRadius * Math.sin(midAngleRad);
    
    return { x, y, rotation: midAngle };
  };

  // Add this diagnostic useEffect
  useEffect(() => {
    console.log('WheelComponent mounted with', segments?.length || 0, 'segments');
    if (segments && segments.length > 0) {
      console.log('First segment:', segments[0]);
    }
  }, [segments]);

  // Add image error handling
  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.warn('Image failed to load:', event.currentTarget.src);
    event.currentTarget.style.display = 'none'; // Hide failed images
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-3 z-10">
          <ArrowBigDown size={32} color={primaryColor} fill={primaryColor} />
        </div>
        
        {/* Add debug info */}
        {(!segments || segments.length === 0) && (
          <div className="bg-red-800 text-white p-4 rounded-md mb-2">
            No segments provided to wheel
          </div>
        )}
        
        <div className="relative" style={{ width: `${size}px`, height: `${size}px` }}>
          <svg 
            width={size} 
            height={size} 
            viewBox={`0 0 ${size} ${size}`}
            className="rounded-full border-4 border-[#3c3c3c]"
          >
            {/* Background circle */}
            <circle cx={centerX} cy={centerY} r={radius} fill="#2d2d2d" />
            
            {/* Wheel segments - only render if we have segments */}
            {segments && segments.length > 0 && (
              <g ref={wheelRef} transform={`rotate(${spinAngle} ${centerX} ${centerY})`}>
                {segments.map((segment, i) => (
                  <g key={segment.id || i}>
                    {/* Segment wedge */}
                    <path
                      d={getSegmentPath(i, segments.length)}
                      fill={segment.color || colors[i % colors.length]}
                      stroke="#111"
                      strokeWidth="1"
                    />
                    
                    {/* Only render images if explicitly provided */}
                    {segment.image && (
                      <g 
                        transform={`
                          translate(${getImagePosition(i, segments.length).x}, ${getImagePosition(i, segments.length).y}) 
                          rotate(${getImagePosition(i, segments.length).rotation + 90})
                        `}
                      >
                        <circle 
                          r="15"
                          fill="white"
                          opacity="0.9"
                        />
                        {/* Skip image rendering for now */}
                        {/* <image 
                          href={segment.image}
                          x="-12" 
                          y="-12"
                          width="24" 
                          height="24"
                          preserveAspectRatio="xMidYMid meet"
                          onError={handleImageError}
                        /> */}
                      </g>
                    )}
                    
                    {/* Segment text */}
                    <g 
                      transform={`
                        translate(${getTextPosition(i, segments.length).x}, ${getTextPosition(i, segments.length).y}) 
                        rotate(${getTextPosition(i, segments.length).rotation + 90})
                      `}
                    >
                      {segment.isReward && segment.rewardValue ? (
                        <>
                          <text
                            x="0"
                            y="-8"
                            fontFamily={fontFamily}
                            fontSize="12"
                            fontWeight="bold"
                            fill={contrastColor}
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            {segment.text}
                          </text>
                          <text
                            x="0"
                            y="8" 
                            fontFamily={fontFamily}
                            fontSize="12"
                            fontWeight="bold"
                            fill={contrastColor}
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            {segment.rewardValue}
                          </text>
                        </>
                      ) : (
                        <text
                          x="0"
                          y="0"
                          fontFamily={fontFamily}
                          fontSize="12"
                          fontWeight="bold" 
                          fill={contrastColor}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          {segment.text}
                        </text>
                      )}
                    </g>
                  </g>
                ))}
              </g>
            )}
            
            {/* Center circle */}
            <circle cx={centerX} cy={centerY} r="20" fill={primaryColor} />
          </svg>
        </div>
      </div>

      <button
        className={`mt-6 px-8 py-2 rounded-full text-center text-xl font-bold tracking-wide ${
          spinningState || (isOnlyOnce && hasSpun) || !segments || segments.length === 0
            ? "bg-gray-600 cursor-not-allowed"
            : "bg-[#007acc] hover:bg-[#0069ac] cursor-pointer"
        } text-white transition-all duration-300`}
        onClick={spin}
        disabled={spinningState || (isOnlyOnce && hasSpun) || !segments || segments.length === 0}
      >
        {buttonText}
      </button>
    </div>
  );
};

export default WheelComponent;
