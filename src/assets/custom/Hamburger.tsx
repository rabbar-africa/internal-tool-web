"use client";

import { createIcon } from "@chakra-ui/react";

export const Hamburger = createIcon({
  displayName: "Hamburger",
  path: (
    <>
      <svg viewBox="0 0 18 12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M17 0.830078H1M17 5.83008H1M17 10.8301H1"
          stroke="currentCOLOR"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </>
  ),
});
