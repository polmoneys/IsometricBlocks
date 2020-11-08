import React from "react";
import "./styles.css";
import { Block } from "./component/block";
import { Scene } from "./component";

export default function App() {
  const blocks1 = [
    {
      pos: { x: 1, y: 3, z: 0 },
      size: { x: 2, y: 2, z: 2.5 },
      color: Block.colors.green
    },
    {
      pos: { x: 2, y: 2, z: 0 },
      size: { x: 1, y: 1, z: 1.5 },
      color: Block.colors.red
    },
    {
      pos: { x: 3, y: 1, z: 0 },
      size: { x: 1, y: 4, z: 1 },
      color: Block.colors.blue
    }
  ];

  const blocks2 = [
    {
      pos: { x: 1, y: 1, z: 0 },
      size: { x: 2, y: 1, z: 1 },
      color: Block.colors.purple
    },
    {
      pos: { x: 2, y: 1, z: 1 },
      size: { x: 1, y: 2, z: 1 },
      color: Block.colors.red
    },
    {
      pos: { x: 1, y: 2, z: 0 },
      size: { x: 1, y: 1, z: 1 },
      color: Block.colors.orange
    },
    {
      pos: { x: 1, y: 2, z: 1 },
      size: { x: 1, y: 1, z: 1 },
      color: Block.colors.orange
    }
  ];

  const blocks3 = [
    {
      pos: { x: 1, y: 3, z: 0 },
      size: { x: 2, y: 2, z: 2.5 },
      color: Block.colors.green
    },
    {
      pos: { x: 2, y: 2, z: 0 },
      size: { x: 1, y: 1, z: 1.5 },
      color: Block.colors.red
    },
    {
      pos: { x: 3, y: 1, z: 0 },
      size: { x: 1, y: 4, z: 1 },
      color: Block.colors.blue
    },
    {
      pos: { x: 0.5, y: 5, z: 0 },
      size: { x: 2, y: 1.5, z: 1 },
      color: Block.colors.orange
    },
    {
      pos: { x: 3, y: 3, z: 1 },
      size: { x: 1, y: 1, z: 2.25 },
      color: Block.colors.black
    },
    {
      pos: { x: 2, y: 7, z: 0 },
      size: { x: 1, y: 1, z: 1 },
      color: Block.colors.white
    },
    {
      pos: { x: 5, y: 1.5, z: 0 },
      size: { x: 2, y: 2, z: 1.5 },
      color: Block.colors.purple
    }
  ];

  return (
    <main>
      <Scene
        debug
        of={blocks1}
        scale={(w, h) => {
          return h / 7;
        }}
      />
      <Scene
        debug
        of={blocks2}
        scale={(w, h) => {
          return h / 6;
        }}
      />
      <Scene debug of={blocks3} />
    </main>
  );
}
