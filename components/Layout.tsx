
import { ReactNode } from "react";
import { ComplexNavbar } from "./ComplexNavbar";
type Props = {
    children?: ReactNode;
};
const Layout = ({ children }: Props) => (
    <div>
        <ComplexNavbar/>
        <div className="pt-[60px]">
            {children}
        </div>
    </div>
)
export default Layout;
