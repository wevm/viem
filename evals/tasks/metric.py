# /// script
# requires-python = ">=3.12"
# ///
"""Aggregates trial rewards into suite metrics (mean, pass rate, v2-leak rate)."""

import argparse
import json


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("-i", "--input", required=True)
    parser.add_argument("-o", "--output", required=True)
    args = parser.parse_args()

    rows = []
    with open(args.input) as f:
        for line in f:
            if not line.strip():
                continue
            row = json.loads(line)
            rewards = row.get("rewards") if isinstance(row, dict) else None
            rows.append(rewards if isinstance(rewards, dict) else row if isinstance(row, dict) else {})

    def mean(key: str) -> float:
        values = [float(row.get(key, 0) or 0) for row in rows]
        return sum(values) / len(values) if values else 0.0

    metrics = {
        "mean": mean("reward"),
        "pass_rate": sum(1 for row in rows if row.get("reward") == 1) / len(rows) if rows else 0.0,
        "build_rate": mean("build"),
        "runtime_rate": mean("runtime"),
        "v2_leak_rate": 1.0 - mean("v3_idioms"),
        "n_trials": len(rows),
    }
    with open(args.output, "w") as f:
        json.dump(metrics, f, indent=2)


if __name__ == "__main__":
    main()
