module.exports = {
  plugins: {
    'postcss-px-to-viewport-8-plugin': {
      viewportWidth: 375,
      selectorBlackList: [
        /* 排除 Tailwind 工具类（px 值不应被转换为 vw） */
        /\.p-\d/, /\.m\w?-\d/, /\.gap-\d/, /\.space-\w-\d/,
        /\.w-\d/, /\.h-\d/, /\.min-w-/, /\.min-h-/, /\.max-w-/, /\.max-h-/,
        /\.text-\w\w/, /\.leading-\d/, /\.tracking-\w/,
        /\.rounded\w?-\w/, /\.shadow\w?-\w/,
        /\.top-\d/, /\.left-\d/, /\.right-\d/, /\.bottom-\d/,
        /\.z-\d/, /\.z-\[\d+\]/,
        /\.size-\d/, /\.size-\[/,
        /\.translate-\w/,
        /\.mt-\d/, /\.mb-\d/, /\.ml-\d/, /\.mr-\d/, /\.mx-\d/, /\.my-\d/,
        /\.pt-\d/, /\.pb-\d/, /\.pl-\d/, /\.pr-\d/, /\.px-\d/, /\.py-\d/,
        /\.grid-cols-\d/, /\.grid-cols-\[/,
        /* 排除 FlyonUI 组件类（内部 px 不应转换） */
        /^\.btn/, /^\.modal/, /^\.drawer/, /^\.alert/, /^\.tooltip/,
        /^\.dropdown/, /^\.collapse/, /^\.tab/, /^\.toggle/, /^\.badge/,
        /^\.card/, /^\.menu/, /^\.input/, /^\.textarea/, /^\.select/,
        /^\.navbar/, /^\.overlay/, /^\.divider/, /^\.chat/,
        /^\.u-chip/, /^\.u-card/, /^\.u-num/,
        /^\.z-num/, /^\.tag/, /^\.chip/, /^\.num-btn/,
      ],
    },
  },
}