import { JSX } from "solid-js";
import "./Container.css";

type ContainerProps = {
  children: JSX.Element;
};

const Container = ({ children }: ContainerProps) => {
  return <main id="container">{children}</main>;
};
export default Container;
