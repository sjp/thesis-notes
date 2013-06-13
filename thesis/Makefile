DOCUMENT = thesis
DOCUMENT_BIB = references.bib
DOCUMENT_RNW = $(DOCUMENT).Rnw
DOCUMENT_TEX = $(DOCUMENT).tex
DOCUMENT_PDF = $(DOCUMENT).pdf
CHAPTER_TEXS := $(patsubst tex/%.Rnw, tex/%.tex, $(wildcard tex/*.Rnw))

# Note that for each Rnw file we run them in a separate instance of R.
# This is so that if we change some global settings in R they do not
# propogate across several chapters.

all: $(DOCUMENT_PDF)

$(DOCUMENT_PDF): $(DOCUMENT_TEX) $(DOCUMENT_BIB) $(CHAPTER_TEXS)
	sed -i 's/^.*upquote.*$$//' $(DOCUMENT_TEX) # upquote + inconsolata broken
	pdflatex $(DOCUMENT_TEX)
	bibtex $(DOCUMENT)
	pdflatex $(DOCUMENT_TEX)
	pdflatex $(DOCUMENT_TEX)
	@echo "**"
	@echo "** DOCUMENT BUILT: $(DOCUMENT_PDF)"
	@echo "**"

$(DOCUMENT_TEX): $(DOCUMENT_RNW)
	R -e "library(knitr) ; knit('$<', '$@')"

tex/%.tex: tex/%.Rnw
	R -e "library(knitr) ; knit('$<', '$@')"

clean:
	-ls | grep -E -v '(.*Rnw|bin|examples|images|Makefile|biblatex.*\.tex|.*\.R|README|references\.bib)' | xargs rm
	-rm $(CHAPTER_TEXS) figure/* tex/*svg* tex/*.js tex/*.tex

.PHONY: show
show: $(DOCUMENT_PDF)
	evince $(DOCUMENT_PDF)
