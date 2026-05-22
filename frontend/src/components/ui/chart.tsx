import * as React from "react"
export const ChartContainer = ({children,className}:{children:React.ReactNode,className?:string}) => <div className={className}>{children}</div>
export const ChartTooltip = ({content}:{content?:React.ReactNode}) => <>{content}</>
export const ChartTooltipContent = () => null