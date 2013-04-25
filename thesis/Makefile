DOCUMENT = thesis
DOCUMENT_TEX = $(DOCUMENT).tex
DOCUMENT_PDF = $(DOCUMENT).pdf
CHAPTER_TEXS := $(patsubst tex/%.Rnw, tex/%.tex, $(wildcard tex/*.Rnw))

# Note that for each Rnw file we run them in a separate instance of R.
# This is so that if we change some global settings in R they do not
# propogate across several chapters.

all: $(DOCUMENT_PDF)

$(DOCUMENT_PDF): $(CHAPTER_TEXS)
	pdflatex $(DOCUMENT_TEX)
	bibtex $(DOCUMENT)
	pdflatex $(DOCUMENT_TEX)
	pdflatex $(DOCUMENT_TEX)
	@echo "**"
	@echo "** DOCUMENT BUILT: $(DOCUMENT_PDF)"
	@echo "**"

tex/%.tex: tex/%.Rnw
	R -e "knitr::knit('$<', '$@')"

clean:
	-ls | grep -E -v '(.*tex|bin|images|Makefile|README|.*bib)' | xargs rm
	-rm $(CHAPTER_TEXS) tex/figures/*

.PHONY: show
show: $(DOCUMENT_PDF)
	evince $(DOCUMENT_PDF)
