import React from 'react';
// import { extend } from '@react-three/fiber'; // Removed unused import
// import { Text } from '@react-three/drei'; // Example: if you need Text

// GraphScene component
const GraphScene: React.FC = () => { // Removed props and Props type
  // Scene logic here
  // extend({ Text }); // Example if using Text component from drei in a non-standard way

  return (
    <>
      {/* Example content: replace with actual scene elements */}
      <mesh>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color="lightgreen" />
      </mesh>
      {/* <Text color="black" anchorX="center" anchorY="middle">
        Graph Node
      </Text> */}
    </>
  );
};

export default GraphScene;