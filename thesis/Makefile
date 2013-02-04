DOCUMENT = thesis
DOCUMENT_RNW = $(DOCUMENT).Rnw
DOCUMENT_TEX = $(DOCUMENT).tex
DOCUMENT_PDF = $(DOCUMENT).pdf

all:
	-rm $(DOCUMENT_PDF)
	find . -name "*.Rnw" -exec R -e 'library(knitr) ; knit("{}")' \;
	-rm Rplots.pdf
	pdflatex $(DOCUMENT_TEX)
	bibtex $(DOCUMENT)
	pdflatex $(DOCUMENT_TEX)
	pdflatex $(DOCUMENT_TEX)
	mv $(DOCUMENT_PDF) ./images/
	-rm $(DOCUMENT_TEX) $(DOCUMENT).log $(DOCUMENT).out $(DOCUMENT).aux $(DOCUMENT).toc $(DOCUMENT).lof $(DOCUMENT).lol $(DOCUMENT).lot $(DOCUMENT).bbl $(DOCUMENT).blg *.svg* *.tex *.pdf
	mv ./images/$(DOCUMENT_PDF) ./

show:
	-rm $(DOCUMENT_PDF)
	find . -name "*.Rnw" -exec R -e 'library(knitr) ; knit("{}")' \;
	-rm Rplots.pdf
	pdflatex $(DOCUMENT_TEX)
	bibtex $(DOCUMENT)
	pdflatex $(DOCUMENT_TEX)
	pdflatex $(DOCUMENT_TEX)
	mv $(DOCUMENT_PDF) ./images/
	-rm $(DOCUMENT_TEX) $(DOCUMENT).log $(DOCUMENT).out $(DOCUMENT).aux $(DOCUMENT).toc $(DOCUMENT).lof $(DOCUMENT).lol $(DOCUMENT).lot $(DOCUMENT).bbl $(DOCUMENT).blg *.svg* *.tex *.pdf
	mv ./images/$(DOCUMENT_PDF) ./
	evince $(DOCUMENT_PDF) &

all-dirty:
	-rm $(DOCUMENT_PDF)
	find . -name "*.Rnw" -exec R -e 'library(knitr) ; knit("{}")' \;
	-rm Rplots.pdf
	pdflatex $(DOCUMENT_TEX)
	bibtex $(DOCUMENT)
	pdflatex $(DOCUMENT_TEX)
	pdflatex $(DOCUMENT_TEX)

show-dirty:
	-rm $(DOCUMENT_PDF)
	find . -name "*.Rnw" -exec R -e 'library(knitr) ; knit("{}")' \;
	-rm Rplots.pdf
	pdflatex $(DOCUMENT_TEX)
	bibtex $(DOCUMENT)
	pdflatex $(DOCUMENT_TEX)
	pdflatex $(DOCUMENT_TEX)
	evince $(DOCUMENT_PDF) &

clean:
	-rm $(DOCUMENT_TEX) $(DOCUMENT).log $(DOCUMENT).out $(DOCUMENT).aux $(DOCUMENT).toc Rplots.pdf $(DOCUMENT).lof $(DOCUMENT).lol $(DOCUMENT).lot $(DOCUMENT).bbl $(DOCUMENT).blg $(DOCUMENT).pyg $(DOCUMENT_PDF) *.log *.svg* *.tex *.pdf
