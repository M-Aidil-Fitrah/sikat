// Type augmentation for motion/react
// This helps TypeScript properly resolve types from motion/react package

declare module "motion/react" {
  export * from "framer-motion";
  export { motion, m } from "framer-motion";
}
