.PHONY: help install seed validate patterns quiz simulate test drift ingest ingest-dry all clean

help:
	@echo "Historia pipeline"
	@echo "  make install     install python deps"
	@echo "  make seed        build the authored seed corpus into data/historia/"
	@echo "  make validate    validate every Historia file against the schema"
	@echo "  make patterns    run pattern recognition -> data/patterns/patterns.json"
	@echo "  make quiz        generate the question bank -> data/quiz/questions.json"
	@echo "  make simulate    replay real history through the sim (calibration)"
	@echo "  make test        content-safety regression tests"
	@echo "  make drift       check committed data matches what the pipeline regenerates"
	@echo "  make all         seed -> validate -> patterns -> quiz -> test"
	@echo "  make ingest-dry  check source reachability, write nothing"
	@echo "  make ingest      live scrape all 36 entities (needs network access)"

install:
	pip install -r requirements.txt

seed:
	python3 seed/build.py

validate:
	python3 tools_validate.py

patterns:
	python3 -m patterns.report --json

quiz:
	python3 -m game.quizgen

simulate:
	python3 -m game.simulate --compare

test: validate
	python3 tests_eligibility.py

drift:
	python3 tools_drift.py

all: seed validate patterns quiz test
	@echo "\npipeline green"

ingest-dry:
	python3 -m scrapers.run --all --dry-run

ingest:
	python3 -m scrapers.run --all --workers 3

clean:
	rm -rf cache/* data/patterns data/quiz
