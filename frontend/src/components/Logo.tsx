import * as React from "react";
const SVGComponent = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 354.331 350.635"
    xmlSpace="preserve"
    xmlns="http://www.w3.org/2000/svg"
    style={{
      width: "80px",
      height: "auto",
      position: "absolute",
      top: "35%",
      left: "12%",
      transform: "translate(-52%, -52%) scale(.5)",
      margin: "0",
      padding: "0",
      cursor: "pointer",
      overflow: "visible",
    }}
    {...props}
  >
    <defs>
      <linearGradient
        id="a"
        gradientTransform="matrix(7.39707 0 0 -11.4486 48.367 923.98)"
        x1={26.189}
        y1={5.064}
        x2={93.233}
        y2={5.064}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#905e26" offset={0} />
        <stop stopColor="#f5ec9b" offset={0.5} />
        <stop stopColor="#905e26" offset={1} />
      </linearGradient>
    </defs>
    <g
      style={{
        opacity: 1,
        strokeWidth: 0.8883966,
      }}
      transform="matrix(4.39011 0 0 4.80825 -3030.651 -2896.737)"
    />
    <path
      d="M247.427 602.555C278.16 492.76 424.137 429.67 480.13 314.51c27.09-55.734 14.428-158.646-31.82-199.858-2.462-2.194-12.643-21.968-2.274-14.56 103.05 75.412 186.833 174.973 148.075 271.064-53.784 133.364-192.317 199.967-191.305 335.763.469 56.49 42.043 101.805 94.953 149.184l2.166 9.902c-137.383-39.214-288.3-135.554-252.497-263.451m346.732 149.11c79.807-71.794 128.53-115.409 107.928-198.56 25.056 38.46 48.327 91.802 28.451 133.373-17.777 37.154-35.473 63.043-100.217 99.267-34.312 19.188-60.105 39.97-81.656 74.749-1.125-36.4 5.897-73.203 45.494-108.83m-88.594-123.599c30.522-56.158 75.076-96.348 118.26-153.96 30.652-40.89 58.727-108.801 29.382-164.241l1.894-2.659c44.97 50.25 46.847 132.178 32.74 192.873-22.166 95.429-101.172 133.99-147.08 203.77-17.98 27.333-28.203 60.804-23.106 95.88-50.969-41.61-39.412-121.392-12.09-171.67" 
      fill="url(#a)"
      fontFamily="'Times New Roman'"
      fontSize={16}
      style={{
        fill: "url(#a)",
        strokeWidth: 1.07044,
      }}
      transform="matrix(.71447 0 0 .78252 -172.965 -77.032)"
    />
  </svg>
);
export default SVGComponent;
