// 拼接 base 路径,确保内部链接在配置了 base 的情况下也能正确工作
// import.meta.env.BASE_URL 末尾带斜杠,如 '/your-repo-name/'
export function withBase(path: string): string {
	// 规范化 path:确保以 / 开头,去掉末尾的 /
	const normalized = path.startsWith('/') ? path : '/' + path;
	const trimmed = normalized.endsWith('/') && normalized !== '/' ? normalized.slice(0, -1) : normalized;
	const base = import.meta.env.BASE_URL; // 如 '/your-repo-name/'
	const baseTrimmed = base.endsWith('/') ? base.slice(0, -1) : base; // '/your-repo-name'
	return baseTrimmed + trimmed;
}
