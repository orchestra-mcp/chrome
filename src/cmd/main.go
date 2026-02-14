package main

import (
	"flag"
	"fmt"
	"os"

	"github.com/orchestra-mcp/chrome/config"
	"github.com/orchestra-mcp/chrome/src/generator"
)

func main() {
	if len(os.Args) < 2 || os.Args[1] != "build" {
		fmt.Fprintf(os.Stderr, "Usage: %s build [--workspace <path>]\n", os.Args[0])
		os.Exit(1)
	}

	fs := flag.NewFlagSet("build", flag.ExitOnError)
	workspace := fs.String("workspace", ".", "Path to project workspace root")
	if err := fs.Parse(os.Args[2:]); err != nil {
		fmt.Fprintf(os.Stderr, "Error: %v\n", err)
		os.Exit(1)
	}

	cfg := config.DefaultConfig()
	gen := generator.New(cfg)

	fmt.Printf("[chrome] Generating extension files in %s/%s ...\n", *workspace, cfg.OutputPath)
	if err := gen.Build(*workspace); err != nil {
		fmt.Fprintf(os.Stderr, "[chrome] Build failed: %v\n", err)
		os.Exit(1)
	}
	fmt.Println("[chrome] Extension files generated successfully")
}
