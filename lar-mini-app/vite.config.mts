import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import react from "@vitejs/plugin-react";
import zmp from "zmp-vite-plugin";
import path from "path";

// https://vitejs.dev/config/
export default () => {
  return defineConfig({
    root: ".",
    base: "",
    plugins: [zmp(), tsconfigPaths(), react()],
    resolve: {
      alias: {
        "utils": path.resolve(__dirname, "src/utils"),
        "components": path.resolve(__dirname, "src/components"),
        "pages": path.resolve(__dirname, "src/pages"),
        "hooks": path.resolve(__dirname, "src/hooks"),
        "types": path.resolve(__dirname, "src/types"),
        "static": path.resolve(__dirname, "src/static"),
        "services": path.resolve(__dirname, "src/services"),
        "state": path.resolve(__dirname, "src/state"),
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          api: "modern-compiler",
        },
      },
    },
  });
};
